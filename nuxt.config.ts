// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta:[{ name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no' }],
    },
  },
  devtools: { enabled: true },
  devServer: {
    port: 3001
  },
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    'nuxt-auth-utils',
    '@vueuse/nuxt'
  ],
  vite: {
    server: {
      allowedHosts: ['.local', '.localhost', '.ngrok-free.app', '.ngrok.dev'],
    }
  },
  css: ['~/assets/css/main.css'],
  ignore: ['.sst/**'],
  nitro: {
    preset: 'aws-lambda'
  },
  ui: {
    colorMode: false,
  },
  compatibilityDate: '2025-07-16'
})