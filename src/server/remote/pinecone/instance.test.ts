import { getPineconeClient } from "@/server/remote/pinecone/instance";

test.concurrent("Happy Path", async () => {
  const client = await getPineconeClient();
  expect(client).toBeTruthy();
  expect(typeof client).toBe("object");
});
