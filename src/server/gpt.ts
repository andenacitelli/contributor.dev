import { Configuration, OpenAIApi } from "openai";
import pRetry, { AbortError } from "p-retry";
import { z, ZodError } from "zod";

import { getCache, setCache } from "./cache";
import { logger } from "./logger";
import { prisma } from "@/server/database";

const configuration = new Configuration({
  organization: "org-AyhdgS08Dl3T4zVyowGqiCFD",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const MODELS = {
  STANDARD: "gpt-3.5-turbo",
  EMBEDDING: "text-embedding-ada-002",
};

const GptCallOptionsSchema = z.object({
  temperature: z.number().default(0),
  model: z.string().default(MODELS.STANDARD),
  role: z.string().default("Assistant"),
  schema: z.any(), // Zod schema that the output will be validated against
});

export class BaseGptCaller {
  // Encapsulating in a call allows us to specify certain immutable things only one time
  prisma: any;
  constructor(prisma: any) {
    this.prisma = prisma;
  }

  async request(
    prompt: string,
    options?: z.input<typeof GptCallOptionsSchema>
  ): Promise<string> {
    const validated = GptCallOptionsSchema.parse(
      options ?? { schema: z.any() }
    );
    const call = async () => {
      return await pRetry(async () => {
        try {
          logger.info("Making call.");
          const completion = await openai.createChatCompletion(
            {
              model: validated.model,
              messages: [
                { role: "system", content: validated.role },
                { role: "user", content: prompt },
              ],
              temperature: validated.temperature, // Want behavior to be as deterministic as possible
            },
            {
              timeout: 10_000,
            }
          );
          const output = completion.data.choices[0]!.message!.content as string;
          logger.info("Output: " + output);
          if (validated.schema) validated.schema.parse(output);
          return output;
        } catch (error) {
          if (error instanceof ZodError) {
            logger.error(
              `GPT Error | ${validated.model}:
            ${(error as ZodError).issues
              .map((issue) => issue.message)
              .join("\n")}
            Prompt: ${prompt.substring(0, 100)}...
            Retrying...\n`
            );
            if (process.env.NODE_ENV === "development")
              throw new AbortError(error);
          }
          if (error instanceof Error) {
            logger.error(error.message!);
          }
          throw error;
        }
      });
    };

    let text: string;
    if (validated.temperature == 0) {
      const key = `gpt-${validated.model}-${prompt}`;
      const cached = await getCache(this.prisma, key);
      text = cached ?? (await call());
      if (!cached) await setCache(this.prisma, key, text);
    } else {
      text = await call();
    }
    logger.debug(`GPT Call returned ${text}`);
    return text;
  }

  async getEmbedding(text: string): Promise<number[]> {
    const call = async () => {
      return await pRetry(async () => {
        try {
          const response = await openai.createEmbedding(
            {
              model: MODELS.EMBEDDING,
              input: text,
            },
            {
              timeout: 5_000,
            }
          );
          return response.data.data[0]!.embedding;
        } catch (error) {
          if (error instanceof Error) {
            logger.error(error.message!);
          }
          throw error;
        }
      });
    };
    return await call();
  }
}

export const GptClient = new BaseGptCaller(prisma);
