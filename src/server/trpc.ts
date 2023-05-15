import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const t = initTRPC.context().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

export const createTRPCContext = () => {
  return {};
};

export const procedure = t.procedure;
