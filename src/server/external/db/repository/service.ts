import { z } from "zod";

import { prisma } from "@/server/external/db/instance";

const RepositorySearchOptionsSchema = z.object({
  n: z.number().min(1).max(100).default(10),
  page: z.number().min(1).default(1),
});

export const RepositoryService = {
  findAll: z
    .function()
    .args(RepositorySearchOptionsSchema)
    .implement(async ({ n, page }) => {
      return prisma.repository.findMany({
        take: n,
        skip: (page - 1) * n,
      });
    }),

  findById: z
    .function()
    .args(z.number().min(0))
    .implement(async (id) => {
      return prisma.repository.findUnique({
        where: {
          id,
        },
      });
    }),
};
