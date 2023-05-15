import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  organization: "org-AyhdgS08Dl3T4zVyowGqiCFD",
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);
