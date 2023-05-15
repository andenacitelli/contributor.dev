import { z, ZodSchema } from "zod";

import { PrismaClientWithCache } from "../db/cache/dto";
import { CacheService } from "../db/cache/service";
import { GptDto, MODELS } from "./dto";

export class GptService {
  #cache: CacheService;
  #dto: GptDto;

  constructor(prisma: PrismaClientWithCache) {
    this.#cache = new CacheService(prisma);
    this.#dto = new GptDto();
  }

  prompt = z
    .function()
    .args(
      z.object({
        prompt: z.string(),
        options: z
          .object({
            temperature: z.number().default(0),
            model: z.string().default(MODELS.STANDARD),
            role: z.string().default("Assistant"),
            schema: z.instanceof(ZodSchema).optional(),
          })
          .default({}),
      })
    )
    .returns(z.promise(z.string()))
    .implement(async ({ prompt, options }) => {
      let data;
      if (options.temperature === 0) {
        data = await this.#cache.get({ key: prompt });
        if (data) return data;
      }
      data = await this.#dto.prompt({ prompt, options });
      await this.#cache.set({ key: prompt, value: data });
      return data;
    });

  embedding = z
    .function()
    .args(z.string())
    .returns(z.promise(z.array(z.number()).length(1536)))
    .implement(async (input) => {
      const cache = await this.#cache.get({ key: input });
      if (cache) return JSON.parse(cache);
      const data = await this.#dto.embedding(input);
      await this.#cache.set({ key: input, value: JSON.stringify(data) });
      return data;
    });
}
