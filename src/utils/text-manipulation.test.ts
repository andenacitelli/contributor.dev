import { cleanText } from "@/utils/text-manipulation";

const BASE_STRING = "hello";
describe("Clean", () => {
  test("Dashes", () => {
    expect(cleanText(BASE_STRING + "-")).toBe(BASE_STRING);
  });
  test("Newlines", () => {
    expect(cleanText(BASE_STRING + "\n")).toBe(BASE_STRING);
  });
  test("Markdown links", () => {
    expect(cleanText(BASE_STRING + "[link](https://example.com)")).toBe(
      BASE_STRING
    );
  });
  test("Markdown headings", () => {
    expect(cleanText(BASE_STRING + "#")).toBe(BASE_STRING);
  });
  test("HTML tags", () => {
    expect(cleanText(BASE_STRING + "<div>")).toBe(BASE_STRING);
  });
});
