import { z } from "zod";

export const SupportedLanguagesEnum = z.enum([
  "C",
  "C++",
  "C#",
  "Go",
  "Java",
  "JavaScript",
  "PHP",
  "Python",
  "Ruby",
  "Scala",
  "TypeScript",
]);
export type SupportedLanguages = z.infer<typeof SupportedLanguagesEnum>;

export const SupportedSortsEnum = z.enum(["STARS"]);
export type SupportedSorts = z.infer<typeof SupportedSortsEnum>;

export const QdrantSchemas = {
  CreateRepositoryInputSchema: z.object({
    name: z.string().min(1),
    vectors: z.object({
      size: z.literal(1536),
      distance: z.literal("Cosine"),
    }),
  }),

  UpsertPointInputSchema: z.object({
    batch: z.object({
      ids: z.array(z.number()),
      vectors: z.array(z.array(z.number())),
    }),
  }),

  SearchPointsOutputSchema: z.object({
    time: z.number().min(0),
    status: z.literal("ok"),
    result: z.array(
      z.object({
        id: z.number(),
        version: z.number(),
        score: z.number(),
      })
    ),
  }),
};
