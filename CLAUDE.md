# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Nuxt dev server on `http://localhost:3000`
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run generate` — static site generation
- `npm install` runs `nuxt prepare` (postinstall), which generates `.nuxt/` types and the GraphQL client typings under `#gql`

The GraphQL backend URL is read from `GQL_HOST` (defaults to `http://localhost:8080/query`). Set it before `dev` when pointing at a non-default backend, e.g. `GQL_HOST=http://localhost:9000/query npm run dev`.

There is no test runner, linter, or formatter configured.

## Architecture

Nuxt 4 + Vue 3 + TypeScript SPA that talks to a Go/GraphQL "servidor electoral" backend. UI strings and domain are Spanish (Colombian electoral system).

**Module stack** (`nuxt.config.ts`):
- `@nuxtjs/tailwindcss` — styling. `tailwind.config.js` is intentionally minimal; Nuxt's module discovers content paths automatically. Global stylesheet at `app/assets/css/tailwind.css`.
- `nuxt-graphql-client` — auto-generates a typed client from `.gql` files. It picks up `runtimeConfig.public.GQL_HOST` automatically.

**Nuxt 4 directory layout.** Application code lives under `app/` (not the repo root), which is the Nuxt 4 convention. Auto-imports apply: components in `app/components/` and composables are available without explicit imports inside `.vue` files.

**GraphQL flow.**
1. Schema fragments and queries are defined in `app/queries/*.gql`. Each entity has a `XxxFields` fragment plus the queries that consume it.
2. `app/queries/schema.graphql` is a local copy of the backend SDL (mirrored from `../servidor-electoral/schema.graphql`). `nuxt.config.ts` points the `graphql-client.clients.default.schema` option at it so codegen works offline without the backend running. Refresh this file when the backend schema changes.
3. `nuxt-graphql-client` codegen produces:
   - Typed query composables like `useAsyncGql({ operation: 'GetElecciones' })` — see `app/components/EleccionList.vue` for the canonical usage.
   - Fragment types and enums under the virtual module `#gql` (e.g. `EleccionFieldsFragment`, `TipoEleccion` enum from `#gql/default`).
4. `app/queries/types.ts` re-exports the generated fragment types as plain domain names (`Eleccion`, `Candidato`, etc.) — import these in components rather than the `…FieldsFragment` originals.
5. After editing any `.gql` file (including `schema.graphql`), regenerate types by running `npm run dev` (or `npx nuxt prepare`) so `#gql` stays in sync. If `#gql` ever imports as "Cannot find module", run `nuxt prepare` — `.nuxt/gql/` is gitignored and gets regenerated on demand.
6. The `schema` option's path is resolved relative to Nuxt's `srcDir` (which is `app/` in Nuxt 4), so it's written as `queries/schema.graphql` — NOT `app/queries/...` or `./app/queries/...` (those silently fall back to introspecting `host`).

**Domain model.** Core entities (each has its own `.gql` file): `Eleccion` (election), `Candidato`, `Jurado`, `Votante`, `Nodo`, `Punto`, `Terminal`. An `Eleccion` aggregates `candidatos`, `puntos`, and `nodos`; per-entity lookups go through `…ByEleccion` queries.

**Routing.** File-based via `app/pages/`. `app/layouts/default.vue` wraps every page with the shared `NavBar` and page padding; `app/app.vue` is just `<NuxtLayout><NuxtPage/></NuxtLayout>`.

## Conventions

- 4-space indentation across `.vue`, `.ts`, `.js`, `.gql`, `.json` (enforced by `.editorconfig`).
- Date fields from the API arrive as numeric timestamps (ms). Format with `toLocaleDateString('es-CO', …)` — see `EleccionList.vue:21`.
- User-facing copy is Spanish; keep it consistent with the existing tone ("Sello Legítimo / Sistema Electoral Colombiano").
