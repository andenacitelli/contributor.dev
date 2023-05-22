import {
  Embedding,
  EmbeddingsRepository,
} from "@/server/remote/openai/embeddings/repository";

export const EmbeddingsService = {
  get: async (prompt: string): Promise<Embedding> => {
    return EmbeddingsRepository.get(prompt);
  },
};
