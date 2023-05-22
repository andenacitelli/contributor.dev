import { PrismaClient } from "@prisma/client";

import { environment } from "@/environment";

export const prisma = new PrismaClient({
  log: environment.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});
