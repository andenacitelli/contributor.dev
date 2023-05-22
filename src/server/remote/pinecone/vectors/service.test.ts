import { VectorsService } from "@/server/remote/pinecone/vectors/service";

const getRandomVector = (): number[] => {
  return Array.from({ length: 1536 }, () => Math.random());
};

test.concurrent("Query", async () => {
  const vector = getRandomVector();
  await VectorsService.addVectors([
    {
      id: "1",
      values: vector,
    },
  ]);

  const response = await VectorsService.query(vector);
  expect(response).toBeTruthy();
  expect(Array.isArray(response)).toBeTruthy();
  expect(response.length).toBeGreaterThan(0);
});

test.concurrent("Add Vectors", async () => {
  const vector = getRandomVector();
  await VectorsService.addVectors([
    {
      id: "1",
      values: vector,
    },
  ]);
});
