import { z } from "zod";

export const PrismaClientWithCacheSchema = z.object({
  cacheEntry: z
    .any()
    .refine(
      (x) =>
        x !== undefined && x.findUnique !== undefined && x.upsert !== undefined
    ),
});
