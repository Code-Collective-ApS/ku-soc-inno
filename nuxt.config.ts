// https://nuxt.com/docs/api/configuration/nuxt-config
function getNumEnvOrDefault(inp: string | undefined, def: number): number {
  if (!inp) return def;
  const inpNum = parseInt(inp);
  if (isNaN(inpNum)) return def;
  return inpNum;
}

const mb = 1024 * 1024;

const plausibleUrl = process.env.NUXT_PLAUSIBLE_HOST;

if (plausibleUrl) {
  console.info("> using plausible host:", plausibleUrl);
} else {
  console.info("> not using plausible integration (missing env)");
}

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "nuxt-auth-utils",
    "nuxt-csurf",
    "@pinia/nuxt",
    "@nuxtjs/plausible",
    "@sentry/nuxt/module",
  ],

  css: ["~/assets/css/main.css"],

  ui: {
    colorMode: false,
  },

  plausible: {
    enabled: !!plausibleUrl,
    ignoredHostnames: ["localhost"],
    proxy: true,
    apiHost: plausibleUrl,
    formSubmissions: true,
    fileDownloads: true,
    autoPageviews: true,
  },

  runtimeConfig: {
    plausibleUrl,
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
      plausibleUrl: process.env.NUXT_PUBLIC_PLAUSIBLE_URL,
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

  routeRules: {
    "/_plausible/api/event": {
      csurf: false,
      // TODO: csurf is not recognized as type, but it works
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
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
    client: "hidden",
  },
});
