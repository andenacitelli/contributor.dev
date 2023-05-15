import { PineconeClient } from "@pinecone-database/pinecone";

import { environment } from "@/env/server.mjs";
import { logger } from "@/utils/logger";

let initialized = false;
const pinecone = new PineconeClient();

export const getPineconeInstance = async () => {
  logger.info("Getting instance.");
  if (!initialized) {
    await pinecone.init({
      environment: "us-east4-gcp",
      apiKey: environment.PINECONE_API_KEY,
    });
    initialized = true;
  }
  return pinecone;
};

export { pinecone };
