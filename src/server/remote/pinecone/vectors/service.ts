import {
  getPineconeClient,
  REPOSITORIES_COLLECTION_NAME,
} from "@/server/remote/pinecone/instance";
import { ScoredVector, Vector } from "@pinecone-database/pinecone";
import { z } from "zod";
import { environment } from "@/environment";

const pinecone = await getPineconeClient();
const index = pinecone.Index(
  `${REPOSITORIES_COLLECTION_NAME}-${environment.NODE_ENV}`
);

const QueryOptionsSchema = z.object({
  topK: z.number().int().min(1).default(10),
});
export type QueryOptions = z.infer<typeof QueryOptionsSchema>;

export const VectorsService = {
  query: async (
    vector: Vector,
    options: QueryOptions
  ): Promise<ScoredVector[]> => {
    const response = await index.query({
      queryRequest: {
        vector: vector.values,
        topK: options.topK,
      },
    });
    return response.matches;
  },

  addVectors: async (vectors: Vector[]): Promise<void> => {
    await index.upsert({
      upsertRequest: {
        vectors,
      },
    });
  },
};
