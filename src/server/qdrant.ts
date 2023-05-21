import {z} from "zod";

import {environment} from "@/env/server.mjs";

export const qdrantCall = async (method: string, path: string, body?: any) => {
  z.enum(["GET", "POST", "PUT", "DELETE"]).parse(method);
  z.string().parse(path);
  const res = await fetch(`${environment.QDRANT_HOST}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "api-key": environment.QDRANT_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status !== 200) {
    throw new Error(
      `Failed to call Qdrant.
      res.status: ${res.status}
      res.statusText: ${res.statusText}
      res.text(): ${await res.text()}
      body: ${JSON.stringify(body)}`
    );
  }
  return res.json();
};
