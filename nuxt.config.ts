// https://nuxt.com/docs/api/configuration/nuxt-config
function getNumEnvOrDefault(inp: string | undefined, def: number): number {
  if (!inp) return def;
  const inpNum = parseInt(inp);
  if (isNaN(inpNum)) return def;
  return inpNum;
}

const mb = 1024 * 1024;

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "nuxt-auth-utils",
    "nuxt-csurf",
    "@pinia/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  ui: {
    colorMode: false,
  },
  runtimeConfig: {
    publicHost: process.env.NUXT_PUBLIC_HOST || "https://localhost",
    smtpHost: process.env.NUXT_SMTP_HOST,
    smtpTlsHost: process.env.NUXT_SMTP_HOST_TLS,
    smtpUser: process.env.NUXT_SMTP_USER,
    smtpPass: process.env.NUXT_SMTP_PASS,
    smtpFrom: process.env.NUXT_SMTP_FROM,
    smtpPort: process.env.NUXT_SMTP_PORT,
    verificationSecret: process.env.NUXT_VERIFICATION_SECRET,
    s3AccessKey: process.env.NUXT_S3_ACCESS_KEY,
    s3SecretAccessKey: process.env.NUXT_S3_SECRET_KEY,
    s3BucketName: process.env.NUXT_S3_BUCKET_NAME,
    s3UseSsl: process.env.NUXT_S3_USE_SSL,
    s3Region: process.env.NUXT_S3_REGION,
    s3Prefix: process.env.NUXT_S3_PREFIX,
    s3Endpoint: process.env.NUXT_S3_ENDPOINT,
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
    },
  },
});
