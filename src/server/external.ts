import axios, { AxiosRequestConfig } from "axios";
import pRetry from "p-retry";

import { getCache, setCache } from "./cache";
import { logger } from "./logger";

/**
 * Pipe all external calls through here for centralized caching and logging.
 * @param url The URL to call
 * @param config The Axios config for the call
 */
export const external = async (
  prisma: any,
  url: string,
  config: AxiosRequestConfig,
  cache = true
): Promise<any> => {
  const start = Date.now();
  let data;
  const key = `external-${url}`;
  data = await getCache(prisma, key);
  if (cache && data) {
    data = JSON.parse(data);
  } else {
    data = await pRetry(
      async () => {
        try {
          const response = await axios.get(url, config);
          logger.debug(
            `Got response: ${JSON.stringify(response.data, undefined, 2)}`
          );
          return response.data;
        } catch (error) {
          logger.warn(
            `Caught error ${error} while calling external API ${url}. Retrying...`
          );
          throw error;
        }
      },
      { retries: 2 }
    );
    await setCache(prisma, "external-" + url, JSON.stringify(data));
  }
  logger.debug(`External call to ${url} took ${(Date.now() - start) / 1000}s`);
  return data;
};
