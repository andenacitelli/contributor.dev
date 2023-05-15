import {z} from "zod";

import {schemas} from "@_/github-api-schemas";

export const GithubSchemas = {
    RepositorySearchResult: schemas.repo_search_result_item
        .omit({homepage: true})
        .merge(z.object({homepage: z.string().nullable()})),
    Readme: schemas.content_file,
    Language: z.record(z.string(), z.number()),
};
