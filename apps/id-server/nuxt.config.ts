export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  devServer: { port: 3000 },
  compatibilityDate: '2025-01-01',
  nitro: { preset: 'vercel-edge' },
  runtimeConfig: {
    tursoUrl: '',
    tursoAuthToken: '',
    sessionSecret: 'change-me-to-a-real-secret-at-least-32-chars',
  },
  routeRules: {
    '/api/grants/**': { cors: true },
    '/.well-known/**': { cors: true },
    '/token': { cors: true },
  },
})
