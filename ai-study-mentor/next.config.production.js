/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produktionsoptimering
  experimental: {
    optimizeCss: true,
    optimizeFonts: true,
  },

  // Kompileringsoptimering
  swcMinify: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Bildoptimering
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  // Säkerhetshuvuden
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },

  // Redirect för säkerhet
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },

  // Rewrites för API
  async rewrites() {
    return [
      {
        source: "/api/health",
        destination: "/api/test/integration",
      },
    ];
  },

  // Webpack konfiguration
  webpack: (config, { dev, isServer }) => {
    // Produktionsoptimering
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            enforce: true,
          },
        },
      };
    }

    // Lägg till aliases för bättre importer
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": "./src",
    };

    return config;
  },

  // Environment variabler för frontend
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    APP_VERSION: process.env.npm_package_version || "1.0.0",
  },

  // Output konfiguration
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  trailingSlash: false,

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // PoweredBy header
  poweredByHeader: false,

  // Kompression
  compress: true,

  // Generate ETags
  generateEtags: true,

  // Experimental features för produktion
  experimental: {
    // Turbopack i utveckling
    turbo: process.env.NODE_ENV === "development" ? {} : undefined,

    // App directory
    appDir: true,

    // Optimering
    optimizePackageImports: ["lucide-react", "date-fns"],

    // Instrumentation
    instrumentationHook: true,
  },

  // TypeScript konfiguration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint konfiguration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["src"],
  },

  // Produktionsspecifika inställningar
  ...(process.env.NODE_ENV === "production" && {
    // Ytterligare produktionsoptimering
    experimental: {
      ...nextConfig.experimental,
      optimizeServerReact: true,
      serverMinification: true,
    },
  }),
};

// Validering av miljövariabler
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "PINECONE_API_KEY",
  "PINECONE_INDEX_NAME",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === "production") {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

module.exports = nextConfig;
