export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  devServer: { port: 3000 },
  compatibilityDate: '2025-01-01',
  runtimeConfig: {
    sessionSecret: 'change-me-to-a-real-secret-at-least-32-chars',
    clawgateAdminEmails: '',
  },
  routeRules: {
    '/api/grants/**': { cors: true },
    '/api/agent/**': { cors: true },
    '/.well-known/**': { cors: true },
    '/token': { cors: true },
  },
})
