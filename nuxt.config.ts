// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss', 'nuxt-graphql-client'],

    runtimeConfig: {
        // Used by the local Nitro proxy endpoint at `/api/graphql`
        gqlProxyTarget: process.env.INTERNAL_GQL_HOST || process.env.GQL_HOST || 'http://localhost:8080/query',
        public: {
            // Used by client-side $fetch calls in this codebase.
            // Keep it pointed at the local proxy to avoid CORS in the browser.
            GQL_HOST: process.env.GQL_CLIENT_HOST || '/api/graphql'
        }
    },

    'graphql-client': {
        clients: {
            default: {
                // SSR must use an absolute backend URL (graphql-request requirement)
                host: process.env.INTERNAL_GQL_HOST || process.env.GQL_HOST || 'http://localhost:8080/query',
                // Client-side requests should use the browser-safe proxy path
                clientHost: process.env.GQL_CLIENT_HOST || '/api/graphql',
                schema: 'queries/schema.graphql'
            }
        }
    }
})