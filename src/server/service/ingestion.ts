import { z } from "zod";

import { GptClient } from "@/server/external/clients";
import { prisma } from "@/server/external/db/instance";
import { GithubService } from "@/server/external/github/dto";
import { PineconeService } from "@/server/external/pinecone/vectors/service";
import { Mapper } from "@/server/service/mapper";
import { cleanText } from "@/utils/text-manipulation";
import { logger } from "@/utils/logger";
import { Repository } from "@prisma/client";

/**
 * Removes anything that's meaningless semantically from a given string
 * @param s
 */

/**
 * This script is intended to completely "repave" our persistent state.
 * Resets databases to initial state.
 */
const reset = async () => {
  await prisma.$connect();
  logger.info("Deleting existing data...");
  await Promise.all([
    prisma.repository.deleteMany({}),
    prisma.language.deleteMany({}),
  ]);
};

const database = async (repositories): Promise<void> => {
  // Doing topics beforehand removes potential of write collisions during which require retries; see https://stackoverflow.com/a/68582593/6402548
  await Promise.all(
    repositories.map(async (repository) => {
      const data = {
        ...repository,
        languages: undefined,
      };
      await prisma.repository.upsert({
        where: {
          id: repository.id,
        },
        create: data,
        update: data,
      });
    })
  );
};

const vectors = async (repositories: Repository[]): Promise<void> => {
  const vectors: { id: number; vector: number[]; payload?: any }[] =
    await Promise.all(
      repositories.map(async (repository) => {
        const prompt = `
        Name: ${repository.name}
        Owner: ${repository.owner}
        Description: ${repository.description}
        URL: ${repository.url}
        readme: ${cleanText(repository.readme).slice(0, 1000)}`;
        const embedding = await GptClient.embedding(prompt);
        return {
          id: repository.id,
          vector: embedding,
        };
      })
    );

  await PineconeService.addVectors(
    vectors.map((v) => {
      return { id: v.id.toString(), values: v.vector };
    })
  );
};

const fresh = z
  .function()
  .returns(z.promise(z.void()))
  .implement(async () => {
    await reset();

    logger.info("Retrieving, transforming, and augmenting repositories...");
    const githubRepositories = await GithubService.search.repositories();
    const domainRepositories = await Promise.all(
      githubRepositories.map((r) => Mapper.repository.githubToDomain(r))
    );

    logger.info("Repositories => DB, Embeddings => Vector Store...");
    await Promise.all([
      database(domainRepositories),
      vectors(domainRepositories),
    ]);

    logger.info(
      `Ingested ${domainRepositories.length} repositories into DB + Vector Store.`
    );
  });
