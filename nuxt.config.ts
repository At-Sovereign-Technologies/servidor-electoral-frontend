// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss', 'nuxt-graphql-client'],

    runtimeConfig: {
        public: {
            GQL_HOST: process.env.GQL_HOST || 'http://localhost:8080/query'
        }
    },

    'graphql-client': {
        clients: {
            default: {
                host: process.env.GQL_HOST || 'http://localhost:8080/query',
                schema: 'queries/schema.graphql'
            }
        }
    }
})