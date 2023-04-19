import { environment } from "@/env/server.mjs";
import { PrismaClient } from "@/generated/client";

export const prisma = new PrismaClient({
  log: environment.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});
