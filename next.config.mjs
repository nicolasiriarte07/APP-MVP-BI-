/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Turbopack (Next.js 15+): top-level key, NOT under experimental
  turbopack: {
    resolveAlias: {
      fs: "./lib/empty.js",
      path: "./lib/empty.js",
      crypto: "./lib/empty.js",
      stream: "./lib/empty.js",
      buffer: "./lib/empty.js",
    },
  },
  // Webpack fallback (used when Turbopack is disabled)
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
};

export default nextConfig;
