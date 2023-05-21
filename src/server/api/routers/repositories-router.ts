import { SortOrderSchema } from "@prisma/client/zod";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { FiltersSchema } from "@/pages";
import { GptClient } from "@/server/gpt";
import { qdrantCall } from "@/server/qdrant";
import { createTRPCRouter, procedure } from "@/server/trpc/trpc";
import { QdrantSchemas, SupportedSorts, SupportedSortsEnum } from "@/utils/zod";

import { prisma } from "../../database";

const getOrderBy = (sort: SupportedSorts) => {
  switch (sort) {
    case SupportedSortsEnum.enum.STARS: {
      return { numStars: SortOrderSchema.enum.desc };
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
      const closestVectors = QdrantSchemas.SearchPointsOutputSchema.parse(
        await qdrantCall("POST", "/collections/repositories/points/search", {
          vector: embedding,
          limit: 5,
        })
      );
      return prisma.repository.findMany({
        where: {
          id: {
            in: closestVectors.result.map((result) => result.id),
          },
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
        },
        orderBy: getOrderBy(input.sort),
        skip: (input.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
    }
  }),
  findById: procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      return prisma.repository.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
};

export const repositoriesRouter = createTRPCRouter(procedures);
