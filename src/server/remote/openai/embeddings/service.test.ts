import { EmbeddingsService } from "@/server/remote/openai/embeddings/service";

describe("Positive Scenarios", () => {
  it("Generic", async () => {
    await EmbeddingsService.get("Hello World");
  });

  it("Multiple Calls", () => {
    Array.from({ length: 2 }).map(async () => {
      await EmbeddingsService.get("Hello World");
    });
  });
});
