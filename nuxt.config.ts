// https://nuxt.com/docs/api/configuration/nuxt-config
function getNumEnvOrDefault(inp: string | undefined, def: number): number {
  if (!inp) return def;
  const inpNum = parseInt(inp);
  if (isNaN(inpNum)) return def;
  return inpNum;
}

const mb = 1024 * 1024;

console.log("NODE_ENV = ", process.env.NODE_ENV);

export default defineNuxtConfig({
  // compatibilityDate: "2025-07-15",
  compatibilityDate: "2026-06-05",
  devtools: { enabled: process.env.NUXT_DEVTOOLS_ENABLE === "true" },

  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "nuxt-auth-utils",
    "nuxt-csurf",
    "@pinia/nuxt",
    "@sentry/nuxt/module",
  ],

  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: false,
  },

  runtimeConfig: {
    publicHost: process.env.NUXT_PUBLIC_HOST || "https://localhost",
    s3AccessKey: process.env.NUXT_S3_ACCESS_KEY,
    s3BucketName: process.env.NUXT_S3_BUCKET_NAME,
    s3Endpoint: process.env.NUXT_S3_ENDPOINT,
    s3Prefix: process.env.NUXT_S3_PREFIX,
    s3Region: process.env.NUXT_S3_REGION,
    s3SecretAccessKey: process.env.NUXT_S3_SECRET_KEY,
    s3UseSsl: process.env.NUXT_S3_USE_SSL,
    smtpFrom: process.env.NUXT_SMTP_FROM,
    smtpHost: process.env.NUXT_SMTP_HOST,
    smtpPass: process.env.NUXT_SMTP_PASS,
    smtpPort: process.env.NUXT_SMTP_PORT,
    smtpTlsHost: process.env.NUXT_SMTP_HOST_TLS,
    smtpUser: process.env.NUXT_SMTP_USER,
    public: {
      maxAttachmentSize: getNumEnvOrDefault(
        process.env.NUXT_MAX_ATTACHMENT_SIZE,
        10 * mb,
      ),
      maxIllustrationSize: getNumEnvOrDefault(
        process.env.NUXT_MAX_ATTACHMENT_SIZE,
        2 * mb,
      ),
      maxPdfSize: getNumEnvOrDefault(
        process.env.NUXT_MAX_ATTACHMENT_SIZE,
        10 * mb,
      ),
      sentry: {
        dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
      },
      sentryEnabled: process.env.NUXT_PUBLIC_SENTRY_ENABLED == "true",
      adminName: process.env.NUXT_PUBLIC_ADMIN_NAME,
      adminEmail: process.env.NUXT_PUBLIC_ADMIN_EMAIL,
      webmasterName: process.env.NUXT_PUBLIC_WEBMASTER_NAME,
      webmasterLink: process.env.NUXT_PUBLIC_WEBMASTER_LINK,
      webmasterEmail: process.env.NUXT_PUBLIC_WEBMASTER_EMAIL,
    },
    sentry: {
      dsn: process.env.NUXT_SENTRY_DSN,
      authToken: process.env.NUXT_SENTRY_AUTHTOKEN,
    },
  },

  sentry: {
    enabled: process.env.NUXT_PUBLIC_SENTRY_ENABLED == "true",
    project: process.env.NUXT_SENTRY_PROJECT,
    org: process.env.NUXT_SENTRY_ORG,
    sentryUrl: process.env.NUXT_SENTRY_URL,
    authToken: process.env.NUXT_SENTRY_AUTHTOKEN,
    telemetry: false,
    debug: false,
  },

  sourcemap: {
    client: process.env.NODE_ENV === "production" ? false : "hidden",
    server: process.env.NODE_ENV === "production" ? false : true,
  },

  vite: {
    optimizeDeps: {
      include: [
        "zod",
        ...(process.env.NUXT_DEVTOOLS_ENABLE === "true"
          ? ["@vue/devtools-core", "@vue/devtools-kit"]
          : []),
      ],
    },
  },
});
