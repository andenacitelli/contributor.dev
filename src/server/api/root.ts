import { repositoriesRouter } from "@/server/api/routers/repositories-router";
import { createTRPCRouter } from "@/server/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  repositories: repositoriesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
