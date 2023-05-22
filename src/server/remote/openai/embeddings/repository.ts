import { z } from "zod";
import { openai } from "@/server/remote/openai/instance";
import { OpenAIModels } from "@/server/remote/openai/models";
import { retry } from "@/server/remote/retry";
import { CreateEmbeddingResponse } from "openai";
import { AxiosResponse } from "axios";

const OPENAI_EMBEDDING_LENGTH = 1536;
const EmbeddingSchema = z.array(z.number()).length(OPENAI_EMBEDDING_LENGTH);
export type Embedding = z.infer<typeof EmbeddingSchema>;

const call = async (
  prompt: string
): Promise<AxiosResponse<CreateEmbeddingResponse>> => {
  return retry(async () => {
    return openai.createEmbedding({
      input: prompt,
      model: OpenAIModels.embedding.ADA,
    });
  });
};

export const EmbeddingsRepository = {
  get: async (prompt: string): Promise<Embedding> => {
    const response = await call(prompt);
    return response.data.data[0].embedding;
  },
};
