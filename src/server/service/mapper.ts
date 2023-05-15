import { z } from "zod";

import { GptClient } from "@/server/external/clients";
import { GithubService } from "@/server/external/github/dto";
import { GithubSchemas } from "@/server/external/github/types";
import { cleanText } from "@/utils/text-manipulation";
import parseISO from "date-fns/parseISO";

const getImpactScore = z
  .function()
  .args(GithubSchemas.RepositorySearchResult)
  .returns(z.promise(z.number().min(0).max(1)))
  .implement(async (repository) => {
    // TODO: Factor in repos with similar em beddings
    // TODO: Factor in change in star count / issues over the last day
    const prompt = `You are an assistant helping me determine how impactful contributions to a given GitHub repository would be. This is part of a bigger-scale website that recommends the most impactful open source projects for contributors to make contributions to.
      
      Here is information on the repository:
      
      Name: ${repository.name}
      Description: ${repository.description}
      
      Attributes that generally indicate a higher potential for impact:
      - Repository has the potential to better peoples' lives
      - Repository is not yet mature; may be hinted at in the readme
      - Repository actively encourages contribution
      - Repository does not have a single company responsible for the majority of the work
      - Large number of open issues
      - README is not at least mostly in English
      
      Please reply only with a number between 0 and 1, to two decimal places, where 0 means the repository is not impactful and 1 means the user. Example Valid replies: 0.21, 0.57, 0.89, 1.00. Do NOT include an explanation - just include the number. Please randomly adjust your result += .02, while still staying >= 0 and <= 1.
    `;

    const NumberSchema = z.string().transform((value, context) => {
      const numbers = /[01].\d{2}/g.exec(value);
      const parsed = Number.parseFloat(numbers![0]);
      if (Number.isNaN(parsed)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Not a number",
        });
        return z.NEVER;
      }
      if (parsed < 0 || parsed > 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "0 <= x <= 1",
        });
        return z.NEVER;
      }
      return parsed;
    });

    const response = await GptClient.prompt({
      prompt,
      options: { schema: NumberSchema },
    });

    return NumberSchema.parse(response);
  });

export const Mapper = {
  repository: {
    //* Github Object => Domain Object
    githubToDomain: z
      .function()
      .args(GithubSchemas.RepositorySearchResult)
      .implement(async (repository) => {
        const [readme, impactScore] = await Promise.all([
          GithubService.repositories.readme(
            z.string().parse(repository.owner?.login),
            repository.name
          ),
          getImpactScore(repository),
        ]);

        return {
          id: repository.id,
          owner: z.string().parse(repository.owner?.login),
          name: repository.name,
          description: repository.description ?? "",
          readme: cleanText(readme).slice(0, 2000),
          url: repository.html_url,
          numStars: repository.stargazers_count,
          numIssues: repository.open_issues_count,
          lastActivityTimestamp: parseISO(repository.updated_at),
          topics: repository.topics ?? [],
          impactScore,
          updatedAt: new Date(),
        };
      }),
  },
};
