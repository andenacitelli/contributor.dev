import pRetry, { AbortError } from "p-retry";
import { AxiosError } from "axios";

const NON_RETRYABLE_RESPONSE_CODES = [400, 401, 403, 404, 502, 503, 504];
export const retry = (fn): Promise<any> => {
  return pRetry(() => {
    try {
      return fn();
    } catch (e) {
      if (e instanceof AxiosError) {
        if (NON_RETRYABLE_RESPONSE_CODES.includes(e.response?.status)) {
          throw new AbortError(e);
        }
      }
      throw e;
    }
  });
};
