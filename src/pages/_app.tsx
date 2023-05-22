import { Box, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { type AppType } from "next/app";
import Head from "next/head";

import { api } from "@/client/trpc/api";
import { PROJECT_CONFIG } from "@/config";

export const queryClient = new QueryClient();

const MyApp: AppType = ({ Component }) => {
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
      <Notifications />
      <Analytics />
      <QueryClientProvider client={queryClient}>
        <Box sx={{ position: "relative" }}>
          <Head>
            <title>
              {PROJECT_CONFIG.name + " - " + PROJECT_CONFIG.shortDescription}
            </title>
          </Head>
          <Component />
        </Box>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default api.withTRPC(MyApp);
