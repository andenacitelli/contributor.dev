// Generic cache class for compressing and storing data in the database. If readability is important, don't use this.

import { z } from "zod";

import { CacheEntrySchema } from "./service";
import { PrismaClientWithCacheSchema } from "./types";

export type PrismaClientWithCache = z.infer<typeof PrismaClientWithCacheSchema>;

export class CacheDto {
  #prisma: PrismaClientWithCache;
  constructor(prisma: PrismaClientWithCache) {
    PrismaClientWithCacheSchema.parse(prisma);
    this.#prisma = prisma;
  }

  get = z
    .function()
    .args(z.object({ key: z.string().min(1) }))
    .returns(z.promise(CacheEntrySchema.nullish()))
    .implement(async ({ key }) => {
      return this.#prisma.cacheEntry.findUnique({
        where: {
          key,
        },
      });
    });

  set = z
    .function()
    .args(z.object({ key: z.string().min(1), value: z.string().min(1) }))
    .returns(z.promise(z.void()))
    .implement(async ({ key, value }) => {
      await this.#prisma.cacheEntry.upsert({
        where: {
          key,
        },
        update: {
          value,
        },
        create: {
          key,
          value,
        },
      });
    });
}
