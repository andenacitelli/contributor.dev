import { PineconeClient } from "@pinecone-database/pinecone";
import { environment } from "@/environment";

const instance = new PineconeClient();
export const REPOSITORIES_COLLECTION_NAME = `repositories`;

export const getPineconeClient = async () => {
  await instance.init({
    environment: environment.PINECONE_ENVIRONMENT,
    apiKey: environment.PINECONE_API_KEY,
  });
  return instance;
};
