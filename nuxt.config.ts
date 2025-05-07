// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',

    devtools: {
        enabled: true,

        timeline: {
            enabled: true,
        },
    },
    runtimeConfig: {
        public: {
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        }
    },

    app: {
        head: {
            title: 'Haji no Tabi',
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
        }
    },

    experimental: {
        watcher: "parcel",
    },
    nitro: {
        preset: 'aws-lambda'
    },
    modules: [
      "@element-plus/nuxt",
      "@nuxtjs/tailwindcss",
      '@vueuse/nuxt',
      "nuxt-auth-utils",
      'nuxt-lodash',
    ],
})