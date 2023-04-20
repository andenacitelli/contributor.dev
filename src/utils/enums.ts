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
