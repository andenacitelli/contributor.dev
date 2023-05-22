import { initTRPC } from "@trpc/server";
import superjson from "superjson";

import { prisma } from "../remote/db/database";

export const createTRPCContext = async () => {
  return { prisma };
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export type TRPCContextType = ReturnType<typeof createTRPCContext>;

export const createTRPCRouter = t.router;

export const procedure = t.procedure;
