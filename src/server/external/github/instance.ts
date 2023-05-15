import {Octokit} from "octokit";

import {environment} from "@/env/server.mjs";

export const octokit = new Octokit({
    auth: environment.GITHUB_TOKEN,
});
