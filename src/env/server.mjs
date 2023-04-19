// @ts-check
/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import { environment as clientEnvironment } from "./client.mjs";
import { serverEnvironment, serverSchema } from "./schema.mjs";

const _serverEnvironment = serverSchema.safeParse(serverEnvironment);

if (!_serverEnvironment.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    JSON.stringify(_serverEnvironment)
  );
  throw new Error(`Invalid environment variables.`);
}

for (let key of Object.keys(_serverEnvironment.data)) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    console.warn("❌ You are exposing a server-side env-variable:", key);

    throw new Error("You are exposing a server-side env-variable");
  }
}

export const environment = { ..._serverEnvironment.data, ...clientEnvironment };
