import { prisma } from "../../database";
import { createTRPCRouter, procedure } from "@/server/trpc/trpc";
import { FiltersSchema } from "@/pages";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/client";
import SortOrder = Prisma.SortOrder;
import { z } from "zod";
import { SupportedSorts, SupportedSortsEnum } from "@/utils/enums";
import { GptClient } from "@/server/gpt";
import { qdrantCall } from "@/server/qdrant";
import { logger } from "@/server/logger";
const getOrderBy = (sort: SupportedSorts) => {
  switch (sort) {
    case SupportedSortsEnum.enum.STARS: {
      return { numStars: SortOrder.desc };
    }
    default: {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Unrecognized sort ${sort}!`,
      });
    }
  }
};

const procedures = {
  findAll: procedure.input(FiltersSchema).mutation(async ({ input }) => {
    if (input.prompt) {
      // Interfacing with the chatbot!
      const embedding = await GptClient.getEmbedding(input.prompt);
      const closestVectors = (await qdrantCall(
        "POST",
        "/collections/repositories/points/search",
        {
          vector: embedding,
          limit: 5,
        }
      )) as {
        time: number;
        status: "ok";
        result: {
          id: number;
          version: number;
          score: number;
          payload: {
            id: string;
          };
          vector: number[];
        }[];
      };
      logger.info(`Found ${JSON.stringify(closestVectors)}`);
      return prisma.repository.findMany({
        where: {
          id: {
            in: closestVectors.result.map((result) => result.payload.id),
          },
        },
        include: {
          topics: true,
        },
      });
    } else {
      // General case
      const PAGE_SIZE = 20;
      return prisma.repository.findMany({
        where: {
          name: {
            contains: input.name ?? "",
          },
          language: {
            in: input.languages ?? [],
          },
        },
        include: {
          topics: true,
        },
        orderBy: getOrderBy(input.sort),
        skip: (input.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
    }
  }),
  findById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.repository.findUnique({
        where: {
          id: input.id,
        },
        include: {
          topics: true,
        },
      });
    }),
};

export const repositoriesRouter = createTRPCRouter(procedures);
