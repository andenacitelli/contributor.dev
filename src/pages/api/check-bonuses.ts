import { external } from "@packages/server/src/external";
import { logger } from "@packages/server/src/logger";
import { NextApiHandler } from "next";
import { Octokit } from "octokit";
import { z } from "zod";
const octokit = new Octokit({
  auth: environment.GITHUB_TOKEN,
});

// @ts-ignore
import { parse } from "himalaya";

import { environment } from "@/env/server.mjs";
import { CreditCard, IssuersEnum } from "@/generated/open-api-zod";
import { getCreditCards } from "@/hooks/use-credit-cards";
import { enumToText } from "@/pages";
import { prisma } from "@/server/database";
import { GptClient } from "@/server/gpt";

const handler: NextApiHandler = async (request, response) => {
  try {
    // Validate that the request came from us, as this is otherwise a public endpoint
    z.literal(environment.NEXTAUTH_SECRET).parse(request.query.key);
  } catch {
    return response.status(401).end();
  }

  let index: number;
  try {
    index = Number.parseInt(z.string().parse(request.query.index));
  } catch (error) {
    return response.status(400).json(error);
  }

  // Iterate through each card
  logger.info(`Retrieving cards.`);
  const CREDIT_CARDS = await getCreditCards();
  const cards = CREDIT_CARDS.filter((card) =>
    // @ts-ignore
    [IssuersEnum.enum.BARCLAYS, IssuersEnum.enum.CHASE].includes(card.issuer)
  );
  const card = cards[index];
  if (!card) return response.status(400).send("Invalid index provided.");
  try {
    return response.status(200).json(await handleCard(card));
  } catch (error) {
    logger.error(
      `Error handling card ${enumToText(card.issuer)} ${card.name}: ${error}`
    );
    return response.status(500).end();
  }
};

/**
 * Reduces the Himayala tree to just text nodes. I need the structure.
 * Basically, this is infinitely recursive.
 * If I'm on a text node, return the text.
 * Otherwise, return an array full of recursive calls of all children, filtered to non-empty-strings.
 * @param tree
 */

const blacklistRegex =
  /clear|equinox|tsa|global|saks|uber|lounge|walmart|grubhub|international|dash|chase.com|luggage|friend|credit cards|offers|reimburse|a. |b. |c. |tax|additional|employee|expir|trademark|approved for|more information|\d* weeks|instacart|review/gi;
const codeRegex =
  /if ?\(|function ?\(|<div|<.{0,10}>|__[\da-z]{1,10}__|var |let |const |window.* = |!important/gi;
const transformTree = (
  tree: any,
  card: CreditCard
): string | (string | object)[] => {
  if (tree.type === "text") {
    const s: string = tree.content
      .replaceAll(/[\n\r]/g, " ")
      .replaceAll(/\s{2,}/g, "")
      .trim();
    if (
      // eslint-disable-next-line unicorn/better-regex
      blacklistRegex.test(s) ||
      codeRegex.test(s) ||
      (!s.toLowerCase().includes(card.name.toLowerCase()) && !/\d/g.test(s)) ||
      /\d* years/gi.test(s) ||
      /\d{1,2}x/gi.test(s) ||
      /^\d{1,2}$/.test(s) ||
      s.startsWith("&") ||
      /(?:\d{1,2}\/){2}\d{2,4}/gi.test(s) ||
      /\d\/\d{4}/gi.test(s) ||
      /\d{1,3}\.\d{1,2}/gi.test(s) ||
      /new cardmember bonus/gi.test(s) ||
      /24.?7/gi.test(s) ||
      /covid-19/gi.test(s) ||
      /\d{1,2}st/gi.test(s) ||
      /{.*}/gi.test(s) ||
      /function ?\(/g.test(s) ||
      /\d* seconds/gi.test(s) ||
      / 101/gi.test(s) ||
      /2023/gi.test(s) ||
      /\d*%/gi.test(s) ||
      /\d*\. [a-z]*$/gi.test(s) ||
      /^[.A-Za-z]*.com\/.*$/.test(s)
    )
      return [];
    return s;
  }

  // Only children that are text or that have the potential to have text children
  const children: any[] =
    tree.children?.filter(
      (x: any) => x.type === "text" || x.children?.length > 0
    ) ?? [];

  const childrenResults = children
    .map((tree: any) => transformTree(tree, card))
    .filter((x: any) => x !== "" && (!Array.isArray(x) || x.length > 0));
  if (childrenResults.length === 1) return childrenResults[0] as object[]; // Short-circuit unnecessary nesting
  return childrenResults;
};

const handleCard = async (card: CreditCard) => {
  logger.info(
    `Getting page text for card ${card.issuer} ${card.name} and url ${card.url}...`
  );

  const pageText = await external(
    prisma,
    `https://api.scrapingant.com/v2/general?${new URLSearchParams({
      url: card.url,
      "x-api-key": environment.SCRAPINGANT_API_KEY,
      browser: "false",
    })}`,
    {}
  );

  logger.info(`Got page text for card ${card.issuer} ${card.name}...`);
  const originalTree = parse(pageText) as any[];
  const tree = originalTree
    .map((tree: any) => transformTree(tree, card))
    .filter((x) => !Array.isArray(x) || x.length > 0);

  const cleaned = JSON.stringify(tree);

  const prompt = `I am scraping credit card websites to check whether credit card data I have on file is accurate, especially sign up bonus amounts. This data changes frequently. You are not doing the scraping yourself, but you are helping me process the resulting text. You are a helpful assistant helping me verify whether my data is still accurate based on the provided text.

      My current data (JSON):
      ${JSON.stringify({
        ...card,
        historicalOffers: undefined,
        imageUrl: undefined,
      })}

      I have a tree-like JSON representation of all the text from the HTML page. Text near each other in the tree is likely to be related. Here's the tree:
      ${cleaned}

      Additional Info:
      - Bonuses are usually preceded by "$" if they are a flat amount, or have "Points" near them if they are in a points-based system.

      Your Response:
      - My data is up-to-date => Reply "Up To Date."
      - Text implies an error => Reply "Error" then a brief, ten-word-or-less description of the error.
      - My data is out-of-date => Reply "Fix." then details of how to fix it. Only reply "Fix" if you are confident.
      - Cannot find a bonus on the page => Reply "Unsure."

      Example Responses:
      Error. The server returned a 404 - check your URL.
      Up To Date.
      Unsure.
      Fix. Current bonus is 50k with 5k spend, new bonus is 60k with 5k spend.`;

  const response = await GptClient.request(prompt);
  logger.info(`GPT Response: ${response}`);

  if (response.toLowerCase().startsWith("error.")) {
    throw new Error(response);
  }

  if (response.toLowerCase().includes("up to date.")) {
    return;
  }

  if (response.toLowerCase().includes("fix.")) {
    await handleIssue(card, response);
  }
};

const handleIssue = async (card: CreditCard, gptResponse: string) => {
  const issues = await octokit.rest.issues.listForRepo({
    owner: "aacitelli",
    repo: "credit-card-bonuses-api",
  });

  const existing = issues.data.find(
    (issue) =>
      issue.title.includes(`${enumToText(card.issuer)} ${card.name}`) &&
      issue.state === "open"
  );

  if (existing) {
    // Add comment to existing issue
    logger.info("Updating existing issue...");
    await octokit.rest.issues.createComment({
      owner: "aacitelli",
      repo: "credit-card-bonuses-api",
      issue_number: existing.number,
      body: `This data is still outdated. GPT Guidance: ${gptResponse}`,
    });
  } else {
    // Create new issue
    logger.info("Creating new issue...");
    await octokit.rest.issues.create({
      owner: "aacitelli",
      repo: "credit-card-bonuses-api",
      title: `Outdated: ${enumToText(card.issuer)} ${card.name}`,
      body: `This data is outdated. GPT Guidance: ${gptResponse}`,
    });
  }
};

export default handler;
