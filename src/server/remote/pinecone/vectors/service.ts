import {
  getPineconeClient,
  REPOSITORIES_COLLECTION_NAME,
} from "@/server/remote/pinecone/instance";
import { ScoredVector, Vector } from "@pinecone-database/pinecone";
import { z } from "zod";

const getIndex = async () => {
  const pinecone = await getPineconeClient();
  return pinecone.Index(REPOSITORIES_COLLECTION_NAME);
};

const QueryOptionsSchema = z
  .object({
    topK: z.number().int().min(1).default(10),
  })
  .default({
    topK: 10,
  });
export type QueryOptions = z.infer<typeof QueryOptionsSchema>;

export const VectorsService = {
  query: async (
    vector: number[],
    options?: QueryOptions
  ): Promise<ScoredVector[]> => {
    if (!options) options = QueryOptionsSchema.parse({});
    const index = await getIndex();
    const response = await index.query({
      queryRequest: {
        vector,
        topK: options.topK,
      },
    });
    return response.matches;
  },

  addVectors: async (vectors: Vector[]): Promise<void> => {
    const index = await getIndex();
    await index.upsert({
      upsertRequest: {
        vectors,
      },
    });
  },
};
