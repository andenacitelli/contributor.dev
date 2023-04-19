// @ts-check
import { clientEnvironment, clientSchema } from "./schema.mjs";

const _clientEnvironment = clientSchema.safeParse(clientEnvironment);

export const formatErrors = (
  /** @type {import("zod").ZodFormattedError<Map<string,string>,string>} */
  errors
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
      return "";
    })
    .filter(Boolean);

if (!_clientEnvironment.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    JSON.stringify(_clientEnvironment)
  );
  throw new Error("Invalid environment variables");
}

for (let key of Object.keys(_clientEnvironment.data)) {
  if (!key.startsWith("NEXT_PUBLIC_")) {
    console.warn(
      `❌ Invalid public environment variable name: ${key}. It must begin with 'NEXT_PUBLIC_'`
    );

    throw new Error("Invalid public environment variable name");
  }
}

export const environment = _clientEnvironment.data;
