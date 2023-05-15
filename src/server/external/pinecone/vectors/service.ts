import pRetry from "p-retry";
import {z} from "zod";

import {getPineconeInstance} from "@/server/external/pinecone/instance.js";

const EmbeddingSchema = z.array(z.number()).length(1536);

const INDEX_NAME = "repositories";

const getIndex = async () => {
    const instance = await getPineconeInstance();
    return instance.Index(INDEX_NAME);
};

export const PineconeService = {
    addVectors: z
        .function()
        .args(
            z.array(
                z.object({
                    id: z.string().min(1),
                    values: EmbeddingSchema,
                })
            )
        )
        .returns(z.promise(z.void()))
        .implement(async (vectors) => {
            //* Adds the provided vectors to Pinecone
            const index = await getIndex();
            const _vectors = z
                .array(
                    z.object({
                        id: z.string().min(1),
                        values: EmbeddingSchema,
                    })
                )
                .min(1)
                .parse(vectors);
            await pRetry(() => {
                return index.upsert({
                    upsertRequest: {
                        // @ts-ignore
                        vectors: _vectors,
                    },
                });
            });
        }),

    // query: z
    //   .function()
    //   .args(EmbeddingSchema)
    //   .implement(async (vector) => {
    //     //* Returns an array with the closest IDs to the given vector, as well as their similarities
    //     const index = await getIndex();
    //     const response = await pRetry(() => {
    //       return index.query({
    //         queryRequest: {
    //           topK: 10,
    //           vector,
    //         },
    //       });
    //     });
    //     if (!response.matches) return [];
    //     return response.matches.map((match) => {
    //       return { id: match.id, similarity: match.score ?? 0 };
    //     });
    //   }),
};
