import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { type AppType } from "next/app";

import { Shell } from "@/client/components/shell";
import { api } from "@/client/trpc/api";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps: pageProperties }) => {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "dark",
        loader: "oval",
        components: {
          Stack: {
            defaultProps: {
              spacing: "xs",
            },
          },
          Group: {
            defaultProps: {
              spacing: "xs",
            },
          },
        },
      }}
    >
      <Analytics />
      <QueryClientProvider client={queryClient}>
        <Shell>
          <Component {...pageProperties} />
        </Shell>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default api.withTRPC(MyApp);
