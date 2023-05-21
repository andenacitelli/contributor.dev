import {Octokit} from "octokit";
import {z} from "zod";

import {Prisma} from "@/generated/client";
import {GptClient} from "@/server/gpt";
import {EnrichedRepository} from "scripts/ingest";

import {logger} from "@/server/logger";

const octokit = new Octokit();

export const getImpactScore = async (
  repository: Omit<EnrichedRepository, "impactScore">
): Promise<number> => {
  // TODO: Factor in repos with similar embeddings
  // TODO: Factor in change in star count / issues over the last day
  const prompt = `You are an assistant helping me determine how impactful contributions to a given GitHub repository would be. This is part of a bigger-scale website that recommends the most impactful open source projects for contributors to make contributions to.
      
      Here is information on the repository:
      
      Name: ${repository.name}
      Description: ${repository.description}
      readme (truncated at 1k characters): ${repository.readme.substring(
        0,
        1000
      )}
      languages: ${repository.languages.map((l) => l.name).join(",")}
      # of stars: ${repository.numStars}
      # of open issues: ${repository.numIssues}
      
      Attributes that generally indicate a higher potential for impact:
      - Repository has the potential to better peoples' lives
      - Repository is not yet mature; may be hinted at in the readme
      - Repository actively encourages contribution
      - Repository does not have a single company responsible for the majority of the work
      - Large number of open issues
      - README is not at least mostly in English
      
      Please reply only with a number between 0 and 1, to two decimal places, where 0 means the repository is not impactful and 1 means the user. Example Valid replies: 0.21, 0.57, 0.89, 1.00. Do NOT include an explanation - just include the number. Please randomly adjust your result += .02, while still staying >= 0 and <= 1.
    `;

  const NumberSchema = z.string().transform((val, ctx) => {
    const numbers = /[01].[0-9]{2}/g.exec(val);
    logger.warn(numbers);
    const parsed = parseFloat(numbers![0]);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a number",
      });
      return z.NEVER;
    }
    if (parsed < 0 || parsed > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "0 <= x <= 1",
      });
      return z.NEVER;
    }
    return parsed;
  });

  const response = await GptClient.request(prompt, {
    schema: NumberSchema,
  });

  return NumberSchema.parse(response);
};
