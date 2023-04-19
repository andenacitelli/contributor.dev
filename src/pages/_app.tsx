import { Box } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Shell } from "@packages/ui/src/shell";
import { IconCards, IconSearch } from "@tabler/icons-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type AppType } from "next/app";
import Head from "next/head";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import PlausibleProvider from "next-plausible";

import { PROJECT_CONFIG } from "@/config";
import { api } from "@/utils/api";

const navbarLinkGroups = [
  [
    { icon: <IconSearch size={18} />, label: "Search Cards", link: "/" },
    { icon: <IconCards size={18} />, label: "My Cards", link: "/me" },
  ],
];

export const queryClient = new QueryClient();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProperties },
}) => {
  return (
    <SessionProvider session={session}>
      <PlausibleProvider domain={PROJECT_CONFIG.domain}>
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
          <QueryClientProvider client={queryClient}>
            <Box sx={{ position: "relative" }}>
              <Shell
                projectConfig={PROJECT_CONFIG}
                navbarLinkGroups={navbarLinkGroups}
                icon={<IconCards />}
              >
                <Head>
                  <title>
                    {PROJECT_CONFIG.name +
                      " - " +
                      PROJECT_CONFIG.shortDescription}
                  </title>
                </Head>

                <Component {...pageProperties} />
              </Shell>
            </Box>
          </QueryClientProvider>
        </MantineProvider>
      </PlausibleProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
