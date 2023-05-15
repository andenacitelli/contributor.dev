import axios from "axios";
import pRetry from "p-retry";
import { z } from "zod";

/**
 * Pipe all external calls through here for centralized caching and logging.
 * @param url The URL to call
 * @param config The Axios config for the call
 */
export class HttpDto {
  call = z
    .function()
    .args(z.object({ url: z.string().url(), config: z.any() }))
    .returns(z.any())
    .implement(({ url, config }) => {
      return pRetry(
        async () => {
          const response = await axios.get(url, config);
          return response.data;
        },
        { retries: 2 }
      );
    });
}
