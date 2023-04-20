import { Octokit } from "octokit";
import { environment } from "@/env/server.mjs";
import { prisma } from "@/server/database";
import { logger } from "@/server/logger";
import { GptClient } from "@/server/gpt";
import { qdrantCall } from "@/server/qdrant";

import { createHash } from "crypto";

function hash(string) {
  return createHash("sha256").update(string).digest("hex");
}

const octokit = new Octokit({
  auth: environment.GITHUB_TOKEN,
});

const main = async () => {
  const [repositories, _] = await Promise.all([
    octokit.rest.search.repos({
      q: "stars:>0",
      sort: "stars",
      page: 1,
      per_page: 100,
    }),
    prisma.repository.deleteMany({}),
  ]);

  await Promise.all(
    repositories.data.items.map(async (repository) => {
      if (!repository.owner) return;
      const readme = Buffer.from(
        (
          await octokit.rest.repos.getReadme({
            owner: repository.owner.login,
            repo: repository.name,
          })
        ).data.content,
        "base64"
      ).toString("utf-8");

      const cleanedReadme = readme
        .replace(/\[.*\]\(.*\)/gi, "")
        .replaceAll("-", "")
        .replaceAll("\n", "")
        .replaceAll("#", "")
        .replaceAll(/\d*\. /gi, "")
        .replaceAll(/<.*>/gi, "")
        .replaceAll(/\+/gi, "");

      const data = {
        id: repository.owner.login + "/" + repository.name,
        owner: repository.owner.login,
        name: repository.name,
        description: repository.description,
        url: repository.html_url,
        numStars: repository.stargazers_count,
        numIssues: repository.open_issues_count,
        readme: cleanedReadme.substring(0, 2000),
        language: repository.language ?? "None", // Happens for repos where there's no actual code; ex. https://github.com/Hack-with-Github/Awesome-Hacking
      };

      try {
        await Promise.all([
          prisma.repository.upsert({
            where: {
              id: data.id,
            },
            create: data,
            update: data,
          }),
          Promise.all(
            repository.topics.map(async (topic) => {
              await prisma.topic.upsert({
                where: {
                  name: topic,
                },
                create: {
                  name: topic,
                },
                update: {},
              });
            })
          ),
        ]);
      } catch (e) {
        logger.error(
          `Error ingesting repository ${data.id} with data ${JSON.stringify({
            ...data,
            readme: data.readme.substring(0, 100) + "...",
          })}: ${e}`
        );
        throw e;
      }

      const prompt = `
        Name: ${data.name}
        Owner: ${data.owner}
        Description: ${data.description}
        URL: ${data.url}
        readme: ${cleanedReadme.substring(0, 1000)}
        language: ${data.language ?? "None"}
            `;

      const embedding = await GptClient.getEmbedding(prompt);

      // TODO: Much more efficient to batch these all at once near the end, rather than 100 separate ones
      await qdrantCall("PUT", "/collections/repositories/points", {
        batch: {
          ids: [Math.floor(Math.random() * 1000000000)], // TODO: Hacky
          vectors: [embedding],
          payload: {
            id: data.id,
          },
        },
      });
    })
  );

  logger.info(`Ingested ${repositories.data.items.length} repositories.`);
};

main().catch(console.error);
