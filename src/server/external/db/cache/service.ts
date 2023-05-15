import zlib from "node:zlib";

import { z } from "zod";

import { CacheDto, PrismaClientWithCache } from "./dto";

const TTLEnumSchema = z.enum(["MINUTE", "HOUR", "DAY", "WEEK", "MONTH"]);
const TTLMap = z.record(TTLEnumSchema, z.number().min(1)).parse({
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 60 * 60 * 24,
  WEEK: 60 * 60 * 24 * 7,
  MONTH: 60 * 60 * 24 * 30,
});

export const CacheEntrySchema = z.object({
  key: z.string(),
  value: z.string(),
  updatedAt: z.date(),
});

export class CacheService {
  #dto: CacheDto;
  constructor(prisma: PrismaClientWithCache) {
    this.#dto = new CacheDto(prisma);
  }

  get = z
    .function()
    .args(
      z.object({
        key: z.string(),
        options: z
          .object({
            ttlSeconds: TTLEnumSchema.default("DAY"),
          })
          .default({}),
      })
    )
    .returns(z.promise(z.string().optional()))
    .implement(async ({ key, options }) => {
      const data = await this.#dto.get({ key });
      if (!data) return;
      const timeSeconds = z.number().min(0).parse(TTLMap[options.ttlSeconds]);
      if (
        !timeSeconds &&
        data.updatedAt.getTime() + timeSeconds * 1000 < Date.now()
      ) {
        return;
      }

      return zlib
        .inflateSync(Buffer.from(data.value, "base64"), { level: 9 })
        .toString();
    });

  set = z
    .function()
    .args(z.object({ key: z.string().min(1), value: z.string().min(1) }))
    .returns(z.promise(z.void()))
    .implement(async ({ key, value }) => {
      await this.#dto.set({
        key,
        value: zlib.deflateSync(value, { level: 9 }).toString("base64"),
      });
    });
}
