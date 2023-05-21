import { Prisma } from "@prisma/client";
import { RepositoryCreateInputSchema } from "@prisma/client/zod";
import * as fs from "fs";
import { Octokit } from "octokit";
import pRetry, { AbortError } from "p-retry";
import { z } from "zod";

import { prisma } from "@/server/database";
import { GptClient } from "@/server/gpt";
import { logger } from "@/server/logger";
import { qdrantCall } from "@/server/qdrant";
import { getImpactScore } from "@/utils/impact-score";
import { QdrantSchemas } from "@/utils/zod";
import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

const octokit = new Octokit({
  auth: environment.GITHUB_TOKEN,
});

/**
 * Removes anything that's meaningless semantically from a given string
 * @param s
 */
const clean = (s: string) => {
  return s
    .replaceAll(/\[.*\]\(.*\)/gi, "")
    .replaceAll("-", "")
    .replaceAll("\n", "")
    .replaceAll("#", "")
    .replaceAll(/\d*\. /gi, "")
    .replaceAll(/<.*>/gi, "")
    .replaceAll(/\+/gi, "");
};

/**
 * This script is intended to completely "repave" our persistent state.
 * Resets databases to initial state.
 */
const init = async () => {
  await prisma.$connect();
  logger.info("Deleting existing data...");
  await Promise.all([
    prisma.repository.deleteMany({}),
    (async () => {
      await qdrantCall("DELETE", "/collections/repositories");
      await qdrantCall(
        "PUT",
        "/collections/repositories",
        QdrantSchemas.CreateRepositoryInputSchema.parse({
          name: "repositories",
          vectors: {
            size: 1536,
            distance: "Cosine",
          },
        })
      );
    })(),
  ]);
};

export type EnrichedRepository = Omit<
  z.infer<typeof RepositoryCreateInputSchema>,
  "topics" | "languages"
> & { topics: string[] };
const getEnrichedRepositories = async (): Promise<EnrichedRepository[]> => {
  const repositories = (
    await Promise.all(
      Array.from({ length: 1 }).flatMap(async (_, i) => {
        return (
          await octokit.rest.search.repos({
            q: "stars:250..5000",
            sort: "stars",
            page: i + 1,
            per_page: 100,
          })
        ).data.items;
      })
    )
  ).flat();

  //* Filter out what we can based on data from just the initial search call
  const step1 = repositories.filter((repository) => {
    if (repository.stargazers_count < 250) {
      // Too small to be promising in terms of future impact
      logger.info(
        `Skipping ${repository.owner.login}/${repository.name} because it has too few stars.`
      );
      return false;
    }

    if (repository.stargazers_count > 10000) {
      // Large enough that it's already likely mature
      logger.info(
        `Skipping ${repository.owner.login}/${repository.name} because it has too many stars.`
      );
      return false;
    }

    return true;
  });

  //* Enrich data with network-bound information
  const step2: Omit<EnrichedRepository, "impactScore">[] = (
    await Promise.allSettled(
      step1.map(async (repository) => {
        const [readme, languages, openIssues] = await Promise.all([
          (async () => {
            try {
              const readme = (
                await octokit.rest.repos.getReadme({
                  owner: repository.owner.login,
                  repo: repository.name,
                })
              ).data.content;
              return Buffer.from(readme, "base64").toString("utf-8");
            } catch (e) {
              logger.warn(
                `GitHub repo ${repository.owner.login}/${repository.name} did not have a README. Returning empty string.`
              );
              return "";
            }
          })(),
          (async () => {
            return (
              await octokit.rest.repos.listLanguages({
                owner: repository.owner.login,
                repo: repository.name,
              })
            ).data;
          })(),
          (async () => {
            return (
              await octokit.rest.issues.list({
                owner: repository.owner.login,
                repo: repository.name,
                state: "open",
              })
            ).data;
          })(),
        ]);

        return {
          id: repository.id,
          owner: repository.owner.login,
          name: repository.name,
          description: repository.description,
          readme: clean(readme).substring(0, 2000),
          url: repository.html_url,
          numStars: repository.stargazers_count,
          numIssues: repository.open_issues_count,
          numGoodFirstIssues: openIssues.filter((issue) =>
            issue.labels.some((label) => label === "good first issue")
          ).length,
          lastActivityTimestamp: repository.updated_at,
          topics: repository.topics,
          languages: Object.entries(languages).map(([name, lines]) => ({
            name,
            lines,
          })),
        };
      })
    )
  )
    .filter((result) => result.status === "fulfilled")
    .map(
      (result) => (result as PromiseFulfilledResult<EnrichedRepository>).value
    );

  const step3: EnrichedRepository[] = await Promise.all(
    step2.map(async (repository) => {
      return {
        ...repository,
        impactScore: await getImpactScore(repository),
      };
    })
  );

  const step4: EnrichedRepository[] = step3.filter((repository) => {
    // One more synchronous filter step
    if (repository.impactScore < 0.85) {
      logger.info(
        `Skipping ${repository.owner}/${repository.name} because its impact score ${repository.impactScore} was too low.`
      );
      return false;
    }

    return true;
  });

  logger.info(
    `Reduced ${repositories.length} repositories to ${step4.length} potentially impactful repositories. Writing to repositories.json...`
  );
  fs.writeFileSync(
    "./repositories.json",
    JSON.stringify(step4, null, 2),
    "utf-8"
  );
  return step4;
};

const main = async () => {
  await init();

  logger.info("Retrieving, transforming, and augmenting repositories...");
  const repositories = await getEnrichedRepositories();

  logger.info("Repositories => Planetscale...");
  await planetscale(repositories);
  await prisma.$disconnect();

  logger.info("Generating embeddings and saving vectors to Qdrant...");
  await qdrant(repositories);

  logger.info(
    `Ingested ${repositories.length} repositories into Planetscale + Qdrant.`
  );
};

const planetscale = async (
  repositories: EnrichedRepository[]
): Promise<void> => {
  // Doing topics beforehand removes potential of write collisions during which require retries; see https://stackoverflow.com/a/68582593/6402548
  const topics = [
    ...new Set(repositories.flatMap((repository) => repository.topics)),
  ];
  await Promise.all(
    topics.map(async (topic) => {
      await prisma.topic.upsert({
        where: { name: topic },
        create: { name: topic },
        update: {},
      });
    })
  );
  await Promise.all(
    repositories.map(async (repository) => {
      const data = {
        ...repository,
        topics: {
          connectOrCreate: repository.topics.map((topic) => ({
            // This (should) always connect
            where: { name: topic },
            create: { name: topic },
          })),
        },
        languages: {
          create: repository.languages.map((language) => ({
            name: language.name,
            lines: language.lines,
          })),
        },
      };
      try {
        // Retry is just here for resiliency; we should never hit a collision because we added them all before
        await pRetry(async () => {
          try {
            await Promise.all([
              prisma.repository.upsert({
                where: {
                  id: data.id,
                },
                create: data,
                update: data,
              }),
              ...repository.topics.map((topic) => {
                prisma.topic.upsert({
                  where: { name: topic },
                  create: { name: topic },
                  update: {},
                });
              }),
            ]);
          } catch (e) {
            if (
              e instanceof PrismaClientKnownRequestError &&
              e.code === "P2002"
            ) {
              logger.info(`Concurrent race condition. Retrying...`);
              throw e;
            }
            throw new AbortError(e);
          }
        });
      } catch (e) {
        logger.error(
          `Error ingesting repository ${data.id} with data ${JSON.stringify({
            ...data,
            readme: data.readme.substring(0, 100) + "...",
          })}: ${e}`
        );
        throw e;
      }
    })
  );
};

const qdrant = async (repositories: EnrichedRepository[]): Promise<void> => {
  const embeddings: { id: number; vector: number[]; payload? }[] =
    await Promise.all(
      repositories.map(async (repository) => {
        const prompt = `
        Name: ${repository.name}
        Owner: ${repository.owner}
        Description: ${repository.description}
        URL: ${repository.url}
        readme: ${clean(repository.readme).substring(0, 1000)}
        languages: ${repository.languages.map((l) => l.name).join(", ")}`;
        const embedding = await GptClient.getEmbedding(prompt);
        return {
          id: repository.id,
          vector: embedding,
        };
      })
    );

  logger.info("Ingesting embeddings...");
  await qdrantCall(
    "PUT",
    "/collections/repositories/points",
    QdrantSchemas.UpsertPointInputSchema.parse({
      batch: {
        ids: embeddings.map((e) => e.id),
        vectors: embeddings.map((e) => e.vector),
      },
    })
  );
};

main().catch(console.error);
