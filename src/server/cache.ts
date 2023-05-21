// Generic cache class for compressing and storing data in the database. If readability is important, don't use this.

import * as zlib from "node:zlib";


type CacheEntry = {
  key: string;
  value: string;
  updatedAt: Date;
};
export const TTL = {
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 60 * 60 * 24,
  WEEK: 60 * 60 * 24 * 7,
  MONTH: 60 * 60 * 24 * 30,
};
export const getCache = async (
  prisma: any,
  key: string,
  ttlSeconds: number = TTL.HOUR // Daily
): Promise<string | undefined> => {
  const entry = (await prisma.cacheEntry.findUnique({
    where: {
      key: key.substring(0, 512),
    },
    select: {
      value: true,
      updatedAt: true,
    },
  })) as CacheEntry | undefined;
  if (!entry) return undefined;

  if (entry && entry.updatedAt.getTime() + ttlSeconds * 1000 < Date.now()) {
    return undefined;
  }

  return zlib
    .inflateSync(Buffer.from(entry.value, "base64"), { level: 9 })
    .toString();
};

export const setCache = async (
  prisma: any,
  key: string,
  data: string
): Promise<void> => {
  const value = zlib.deflateSync(data, { level: 9 }).toString("base64");
  await prisma.cacheEntry.upsert({
    where: {
      key: key.substring(0, 512),
    },
    update: {
      value,
    },
    create: {
      key: key.substring(0, 512),
      value,
    },
  });
};
