import { CompletionsRepository } from "@/server/remote/openai/completions/repository";

export const CompletionsService = {
  get: (prompt: string): Promise<string> => {
    return CompletionsRepository.get(prompt);
  },
};
