import { createNextApiHandler } from "@trpc/server/adapters/next";

import { environment } from "@/env/server.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/trpc/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    environment.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
      : undefined,
});
