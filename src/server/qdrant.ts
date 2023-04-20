import { z } from "zod";
import { environment } from "@/env/server.mjs";

export const qdrantCall = z
  .function()
  .args(z.enum(["GET", "POST", "PUT", "DELETE"]), z.string(), z.any())
  .returns(z.any())
  .implement(async (method: string, path: string, body?: any) => {
    const res = await fetch(`${environment.QDRANT_HOST}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "api-key": environment.QDRANT_API_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status !== 200) {
      throw new Error(`Failed to call Qdrant: ${res.status} ${res.statusText}`);
    }
    return res.json();
  });
