import { CompletionsService } from "@/server/remote/openai/completions/service";

const assertStringIsValid = (s: string) => {
  expect(typeof s === "string").toBeTruthy();
  expect(s).toBeTruthy();
  expect(s.length).toBeGreaterThan(0);
};
describe("Positive Scenarios", () => {
  test.concurrent("Generic", async () => {
    assertStringIsValid(await CompletionsService.get("Hello!"));
  });
});
