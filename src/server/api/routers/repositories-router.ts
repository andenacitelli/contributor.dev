import { prisma } from "../../database";
import { createTRPCRouter, procedure } from "@/server/trpc/trpc";

const procedures = {
  findAll: procedure.query(async () => {
    return prisma.repository.findMany();
  }),
};

export const repositoriesRouter = createTRPCRouter(procedures);
