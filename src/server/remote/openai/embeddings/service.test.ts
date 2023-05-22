import { EmbeddingsService } from "@/server/remote/openai/embeddings/service";

const assertEmbeddingIsValid = (embedding: number[]) => {
  expect(Array.isArray(embedding)).toBeTruthy();
  expect(embedding.length).toBeGreaterThan(0);
  expect(embedding.length).toBe(1536);
};

describe("Positive Scenarios", () => {
  test.concurrent("Generic", async () => {
    assertEmbeddingIsValid(await EmbeddingsService.get("Hello World"));
  });
});
