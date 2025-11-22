import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@prisma/client"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        ".prisma/client": path.resolve(__dirname, "node_modules/.prisma/client"),
      };
    }
    return config;
  },
};

export default nextConfig;
