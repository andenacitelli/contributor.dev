import { Configuration, OpenAIApi } from "openai";
import { environment } from "@/environment";

const configuration = new Configuration({
  apiKey: environment.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
