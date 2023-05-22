// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */

// TODO: Validate environment variables; caused issues with swc/jest

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
}

export default config;
