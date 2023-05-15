import pRetry from "p-retry";
import { z } from "zod";

import { openai } from "./instance";

export const MODELS = {
  STANDARD: "gpt-3.5-turbo",
  EMBEDDING: "text-embedding-ada-002",
};

export class GptDto {
  prompt = z
    .function()
    .args(
      z.object({
        prompt: z.string().min(1),
        options: z
          .object({
            temperature: z.number().default(0),
            model: z.string().default(MODELS.STANDARD),
            role: z.string().default("Assistant"),
          })
          .default({}),
      })
    )
    .returns(z.promise(z.string().min(1)))
    .implement(async ({ prompt, options }) => {
      return await pRetry(async () => {
        const response = await openai.createChatCompletion(
          {
            model: options.model,
            messages: [
              { role: "system", content: options.role },
              { role: "user", content: prompt },
            ],
            temperature: options.temperature, // Want behavior to be as deterministic as possible
          },
          {
            timeout: 10_000,
          }
        );
        return z.string().parse(response.data?.choices[0]?.message?.content);
      });
    });

  embedding = z
    .function()
    .args(z.string())
    .returns(z.promise(z.array(z.number()).length(1536)))
    .implement(async (input) => {
      return await pRetry(async () => {
        const response = await openai.createEmbedding(
          {
            model: MODELS.EMBEDDING,
            input,
          },
          {
            timeout: 5000,
          }
        );
        return z
          .array(z.number())
          .length(1536)
          .parse(response.data.data[0]?.embedding);
      });
    });
}
