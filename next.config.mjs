/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // xlsx uses Node.js built-ins (fs, path, crypto) that don't exist in the browser.
  // This config tells the bundler to replace them with empty stubs.
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        fs: { browser: "./lib/empty.js" },
        path: { browser: "./lib/empty.js" },
        crypto: { browser: "./lib/empty.js" },
        stream: { browser: "./lib/empty.js" },
        buffer: { browser: "./lib/empty.js" },
      },
    },
  },
};

export default nextConfig;
