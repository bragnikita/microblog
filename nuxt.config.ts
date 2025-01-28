// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',

    devtools: {
        enabled: true,

        timeline: {
            enabled: true,
        },
    },

    experimental: {
        watcher: "parcel",
    },
    nitro: {
        preset: 'aws-lambda'
    },
    modules: ["@element-plus/nuxt", "@nuxtjs/tailwindcss", '@vueuse/nuxt'],
})