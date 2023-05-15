import { z } from "zod";

import { PrismaClientWithCache } from "../db/cache/dto";
import { CacheService } from "../db/cache/service";
import { HttpDto } from "./dto";

export class HttpService {
  #dto: HttpDto;
  #cache: CacheService;
  constructor(prisma: PrismaClientWithCache) {
    this.#dto = new HttpDto();
    this.#cache = new CacheService(prisma);
  }

  get = z
    .function()
    .args(
      z.object({
        url: z.string().url(),
        config: z.any(),
        options: z.object({ cache: z.boolean().default(false) }).default({}),
      })
    )
    .returns(z.promise(z.any()))
    .implement(async ({ url, config, options }) => {
      if (options.cache) {
        const data = await this.#cache.get({ key: url });
        if (data) return data;
      }

      const response = await this.#dto.call({ url, config });

      if (options.cache) await this.#cache.set({ key: url, value: response });
      return response;
    });
}
