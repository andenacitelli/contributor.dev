import {z} from "zod";

import {octokit} from "@/server/external/github/instance";
import {GithubSchemas} from "@/server/external/github/types";

export const GithubService = {
    search: {
        repositories: z
            .function()
            .returns(z.promise(z.array(GithubSchemas.RepositorySearchResult)))
            .implement(async () => {
                const response = await octokit.rest.search.repos({
                    q: "stars:250..5000",
                    sort: "stars",
                    page: 1,
                    per_page: 5,
                });

                return response.data.items;
            }),
    },

    repositories: {
        readme: z
            .function()
            .args(z.string(), z.string())
            .returns(z.promise(z.string()))
            .implement(async (owner, repo) => {
                const response = await octokit.rest.repos.getReadme({
                    owner,
                    repo,
                });
                return Buffer.from(response.data.content, "base64").toString("utf8");
            }),

        languages: z
            .function()
            .args(z.string(), z.string())
            .returns(z.promise(GithubSchemas.Language))
            .implement(async (owner, repo) => {
                const response = await octokit.rest.repos.listLanguages({
                    owner,
                    repo,
                });
                return response.data;
            }),
    },
};
