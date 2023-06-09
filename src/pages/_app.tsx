import {
  Anchor,
  AppShell,
  Box,
  Burger,
  Group,
  Header,
  MediaQuery,
  Navbar,
  Title,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { IconApiApp, IconCards, IconSearch } from "@tabler/icons-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type AppType } from "next/app";
import Head from "next/head";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import PlausibleProvider from "next-plausible";

import { PROJECT_CONFIG } from "@/config";
import { api } from "@/client/trpc/api";
import Link from "next/link";
import { useState } from "react";

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
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
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
              <Head>
                <title>
                  {PROJECT_CONFIG.name +
                    " - " +
                    PROJECT_CONFIG.shortDescription}
                </title>
              </Head>
              <Component {...pageProperties} />
            </Box>
          </QueryClientProvider>
        </MantineProvider>
      </PlausibleProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
