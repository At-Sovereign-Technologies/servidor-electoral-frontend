export default defineNitroPlugin(() => {
  console.log("=== ENV ===")
  console.log({
    INTERNAL_GQL_HOST: process.env.INTERNAL_GQL_HOST,
    GQL_HOST: process.env.GQL_HOST,
    GQL_CLIENT_HOST: process.env.GQL_CLIENT_HOST,
    NODE_ENV: process.env.NODE_ENV
  })
})
