import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const language = z.record(z.number());
const content_file = z.object({
  type: z.literal("file"),
  encoding: z.string(),
  size: z.number().int(),
  name: z.string(),
  path: z.string(),
  content: z.string(),
  sha: z.string(),
  url: z.string().url(),
  git_url: z.string().url().nullable(),
  html_url: z.string().url().nullable(),
  download_url: z.string().url().nullable(),
  _links: z.object({
    git: z.string().url().nullable(),
    html: z.string().url().nullable(),
    self: z.string().url(),
  }),
  target: z.string().optional(),
  submodule_git_url: z.string().optional(),
});
const nullable_simple_user = z.object({
  name: z.string().nullish(),
  email: z.string().nullish(),
  login: z.string(),
  id: z.number().int(),
  node_id: z.string(),
  avatar_url: z.string().url(),
  gravatar_id: z.string().nullable(),
  url: z.string().url(),
  html_url: z.string().url(),
  followers_url: z.string().url(),
  following_url: z.string(),
  gists_url: z.string(),
  starred_url: z.string(),
  subscriptions_url: z.string().url(),
  organizations_url: z.string().url(),
  repos_url: z.string().url(),
  events_url: z.string(),
  received_events_url: z.string().url(),
  type: z.string(),
  site_admin: z.boolean(),
  starred_at: z.string().optional(),
});
const nullable_license_simple = z.object({
  key: z.string(),
  name: z.string(),
  url: z.string().url().nullable(),
  spdx_id: z.string().nullable(),
  node_id: z.string(),
  html_url: z.string().url().optional(),
});
const search_result_text_matches = z.array(
  z
    .object({
      object_url: z.string(),
      object_type: z.string().nullable(),
      property: z.string(),
      fragment: z.string(),
      matches: z.array(
        z.object({ text: z.string(), indices: z.array(z.number()) }).partial()
      ),
    })
    .partial()
);
const repo_search_result_item = z.object({
  id: z.number().int(),
  node_id: z.string(),
  name: z.string(),
  full_name: z.string(),
  owner: nullable_simple_user.nullable(),
  private: z.boolean(),
  html_url: z.string().url(),
  description: z.string().nullable(),
  fork: z.boolean(),
  url: z.string().url(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  pushed_at: z.string().datetime(),
  homepage: z.string().url().nullable(),
  size: z.number().int(),
  stargazers_count: z.number().int(),
  watchers_count: z.number().int(),
  language: z.string().nullable(),
  forks_count: z.number().int(),
  open_issues_count: z.number().int(),
  master_branch: z.string().optional(),
  default_branch: z.string(),
  score: z.number(),
  forks_url: z.string().url(),
  keys_url: z.string(),
  collaborators_url: z.string(),
  teams_url: z.string().url(),
  hooks_url: z.string().url(),
  issue_events_url: z.string(),
  events_url: z.string().url(),
  assignees_url: z.string(),
  branches_url: z.string(),
  tags_url: z.string().url(),
  blobs_url: z.string(),
  git_tags_url: z.string(),
  git_refs_url: z.string(),
  trees_url: z.string(),
  statuses_url: z.string(),
  languages_url: z.string().url(),
  stargazers_url: z.string().url(),
  contributors_url: z.string().url(),
  subscribers_url: z.string().url(),
  subscription_url: z.string().url(),
  commits_url: z.string(),
  git_commits_url: z.string(),
  comments_url: z.string(),
  issue_comment_url: z.string(),
  contents_url: z.string(),
  compare_url: z.string(),
  merges_url: z.string().url(),
  archive_url: z.string(),
  downloads_url: z.string().url(),
  issues_url: z.string(),
  pulls_url: z.string(),
  milestones_url: z.string(),
  notifications_url: z.string(),
  labels_url: z.string(),
  releases_url: z.string(),
  deployments_url: z.string().url(),
  git_url: z.string(),
  ssh_url: z.string(),
  clone_url: z.string(),
  svn_url: z.string().url(),
  forks: z.number().int(),
  open_issues: z.number().int(),
  watchers: z.number().int(),
  topics: z.array(z.string()).optional(),
  mirror_url: z.string().url().nullable(),
  has_issues: z.boolean(),
  has_projects: z.boolean(),
  has_pages: z.boolean(),
  has_wiki: z.boolean(),
  has_downloads: z.boolean(),
  has_discussions: z.boolean().optional(),
  archived: z.boolean(),
  disabled: z.boolean(),
  visibility: z.string().optional(),
  license: nullable_license_simple.nullable(),
  permissions: z
    .object({
      admin: z.boolean(),
      maintain: z.boolean().optional(),
      push: z.boolean(),
      triage: z.boolean().optional(),
      pull: z.boolean(),
    })
    .optional(),
  text_matches: search_result_text_matches.optional(),
  temp_clone_token: z.string().optional(),
  allow_merge_commit: z.boolean().optional(),
  allow_squash_merge: z.boolean().optional(),
  allow_rebase_merge: z.boolean().optional(),
  allow_auto_merge: z.boolean().optional(),
  delete_branch_on_merge: z.boolean().optional(),
  allow_forking: z.boolean().optional(),
  is_template: z.boolean().optional(),
  web_commit_signoff_required: z.boolean().optional(),
});

export const schemas = {
  language,
  content_file,
  nullable_simple_user,
  nullable_license_simple,
  search_result_text_matches,
  repo_search_result_item,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/repos/:owner/:repo/languages",
    description: `Lists languages for the specified repository. The value shown for each language is the number of bytes of code written in that language.`,
    requestFormat: "json",
    parameters: [
      {
        name: "owner",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "repo",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.record(z.number()),
  },
  {
    method: "get",
    path: "/repos/:owner/:repo/readme",
    description: `Gets the preferred README for a repository.

READMEs support [custom media types](https://docs.github.com/rest/reference/repos#custom-media-types) for retrieving the raw content or rendered HTML.`,
    requestFormat: "json",
    parameters: [
      {
        name: "owner",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "repo",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ref",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: content_file,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/repos/:owner/:repo/readme/:dir",
    description: `Gets the README from a repository directory.

READMEs support [custom media types](https://docs.github.com/rest/reference/repos#custom-media-types) for retrieving the raw content or rendered HTML.`,
    requestFormat: "json",
    parameters: [
      {
        name: "owner",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "repo",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "dir",
        type: "Path",
        schema: z.string(),
      },
      {
        name: "ref",
        type: "Query",
        schema: z.string().optional(),
      },
    ],
    response: content_file,
    errors: [
      {
        status: 404,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
    ],
  },
  {
    method: "get",
    path: "/search/repositories",
    description: `Find repositories via various criteria. This method returns up to 100 results [per page](https://docs.github.com/rest/overview/resources-in-the-rest-api#pagination).

When searching for repositories, you can get text match metadata for the **name** and **description** fields when you pass the &#x60;text-match&#x60; media type. For more details about how to receive highlighted search results, see [Text match metadata](https://docs.github.com/rest/reference/search#text-match-metadata).

For example, if you want to search for popular Tetris repositories written in assembly code, your query might look like this:

&#x60;q&#x3D;tetris+language:assembly&amp;sort&#x3D;stars&amp;order&#x3D;desc&#x60;

This query searches for repositories with the word &#x60;tetris&#x60; in the name, the description, or the README. The results are limited to repositories where the primary language is assembly. The results are sorted by stars in descending order, so that the most popular repositories appear first in the search results.`,
    requestFormat: "json",
    parameters: [
      {
        name: "q",
        type: "Query",
        schema: z.string(),
      },
      {
        name: "sort",
        type: "Query",
        schema: z
          .enum(["stars", "forks", "help-wanted-issues", "updated"])
          .optional(),
      },
      {
        name: "order",
        type: "Query",
        schema: z.enum(["desc", "asc"]).optional().default("desc"),
      },
      {
        name: "per_page",
        type: "Query",
        schema: z.number().int().optional().default(30),
      },
      {
        name: "page",
        type: "Query",
        schema: z.number().int().optional().default(1),
      },
    ],
    response: z.object({
      total_count: z.number().int(),
      incomplete_results: z.boolean(),
      items: z.array(repo_search_result_item),
    }),
    errors: [
      {
        status: 304,
        schema: z.void(),
      },
      {
        status: 422,
        schema: z.void(),
      },
      {
        status: 503,
        schema: z.void(),
      },
    ],
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
