export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  devServer: { port: 3001 },
  compatibilityDate: '2025-01-01',
  nitro: { preset: 'vercel-edge' },
  runtimeConfig: {
    tursoUrl: '',
    tursoAuthToken: '',
    sessionSecret: 'change-me-sp-secret-at-least-32-chars-long',
    spId: '',
    spRedirectUri: '',
    clawgateUrl: 'https://id.delta-mind.at',
  },
})
