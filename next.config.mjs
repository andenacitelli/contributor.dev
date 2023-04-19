// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));
import { withPlausibleProxy } from "next-plausible";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin"

/** @type {import("next").NextConfig} */
const config = withPlausibleProxy()({
  reactStrictMode: true,
  transpilePackages: ["@packages/ui"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    return config
  },
});
export default config;
