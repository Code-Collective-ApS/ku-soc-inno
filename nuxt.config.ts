// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-auth-utils", "nuxt-csurf"],
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
  },
});
