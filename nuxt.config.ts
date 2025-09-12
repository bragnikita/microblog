// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
      allowedHosts: ['.local', '.localhost', '.ngrok-free.app'],
    }
  },
  css: ['~/assets/css/main.css'],
  ignore: ['.sst/**'],
      nitro: {
        preset: 'aws-lambda'
    },
  compatibilityDate: '2025-07-16'
})