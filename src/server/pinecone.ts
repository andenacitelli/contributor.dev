import { PineconeClient } from "@pinecone-database/pinecone";

const pinecone = new PineconeClient();

export const getPineconeClient = async () => {
  await pinecone.init({
    environment: "YOUR_ENVIRONMENT",
    apiKey: "YOUR_API_KEY",
  });
  return pinecone;
};
