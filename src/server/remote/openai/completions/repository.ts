import { openai } from "@/server/remote/openai/instance";
import { OpenAIModels } from "@/server/remote/openai/models";
import { retry } from "@/server/remote/retry";
import { CreateChatCompletionResponse } from "openai";
import { AxiosResponse } from "axios";

const call = async (
  prompt: string
): Promise<AxiosResponse<CreateChatCompletionResponse>> => {
  return retry(async () => {
    return openai.createChatCompletion({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: OpenAIModels.chat.THREE_POINT_FIVE,
    });
  });
};

export const CompletionsRepository = {
  get: async (prompt: string): Promise<string> => {
    const response = await call(prompt);
    return response.data.choices[0].message.content;
  },
};
