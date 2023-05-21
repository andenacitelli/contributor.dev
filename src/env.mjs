// src/env.mjs
import {createEnv} from "@t3-oss/env-nextjs";
import {z} from "zod";

export const env = createEnv({
    /*
     * Serverside Environment variables, not available on the client.
     * Will throw if you access these variables on the client.
     */
    server: {
        POSTGRES_URL: z.string().url(),
        OPENAI_API_KEY: z.string().min(1),
        PINECONE_API_KEY: z.string().min(1),
        GITHUB_TOKEN: z.string().min(1),
    },
    /*
     * Environment variables available on the client (and server).
     *
     * 💡 You'll get typeerrors if these are not prefixed with NEXT_PUBLIC_.
     */
    client: {},
    /*
     * Due to how Next.js bundles environment variables on Edge and Client,
     * we need to manually destructure them to make sure all are included in bundle.
     *
     * 💡 You'll get typeerrors if not all variables from `server` & `client` are included here.
     */
    runtimeEnv: {
        POSTGRES_URL: process.env.POSTGRES_URL,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        PINECONE_API_KEY: process.env.PINECONE_API_KEY,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN
    },
});