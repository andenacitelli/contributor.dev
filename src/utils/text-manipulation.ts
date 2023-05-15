import { z } from "zod";

export const cleanText = z
  .function()
  .args(z.string())
  .returns(z.string())
  .implement((s) => {
    return s
      .replaceAll(/\[.*]\(.*\)/gi, "")
      .replaceAll("-", "")
      .replaceAll("\n", "")
      .replaceAll("#", "")
      .replaceAll(/\d*\. /gi, "")
      .replaceAll(/<.*>/gi, "")
      .replaceAll(/\+/gi, "");
  });
