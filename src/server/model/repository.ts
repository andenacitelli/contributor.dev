import { z } from "zod";

export const RepositorySchema = z.object({});
export type Repository = z.infer<typeof RepositorySchema>;
