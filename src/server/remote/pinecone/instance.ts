import { PineconeClient } from "@pinecone-database/pinecone";
import { environment } from "@/environment";
import { logger } from "@/server/logger";

const instance = new PineconeClient();
export const REPOSITORIES_COLLECTION_NAME = `repositories`;

const OPENAI_EMBEDDING_LENGTH = 1536;

export const getPineconeClient = async () => {
  logger.info(`Initializing Pinecone client`);
  await instance.init({
    environment: environment.PINECONE_ENVIRONMENT,
    apiKey: environment.PINECONE_API_KEY,
  });

  logger.info("Initialized Pinecone client");
  try {
    // Ensure index already exists
    await instance.createIndex({
      createRequest: {
        name: REPOSITORIES_COLLECTION_NAME,
        dimension: OPENAI_EMBEDDING_LENGTH,
      },
    });
  } catch (e) {
    logger.warn(
      `Attempted to create already existing index ${REPOSITORIES_COLLECTION_NAME}`
    );
    // error silently
  }

  logger.info("Created Pinecone index");

  return instance;
};
