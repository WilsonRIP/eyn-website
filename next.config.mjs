/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle Tesseract.js worker files
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Ignore React Native modules that might be pulled in by dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native-fs': false,
      'react-native': false,
    };

    // Ignore problematic modules
    config.externals = config.externals || [];
    config.externals.push('react-native-fs');

    return config;
  },
  // Add headers for cross-origin isolation to support WebAssembly
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
