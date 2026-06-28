# Tech Stack

## Core

- React: UI component framework
- TypeScript: type-safe application code
- Vite: local dev server and production build tool
- pnpm: package manager

## Styling

- Tailwind CSS: utility-first styling system
- `@tailwindcss/vite`: Tailwind integration for Vite

## Data And State

- TanStack Query: server-state fetching, caching, retries, and invalidation
- Zustand: lightweight client-state store
- Zod: runtime validation and schema typing for API payloads and forms

## Current Setup Notes

- Tailwind is wired through `vite.config.ts` and `src/index.css`.
- TanStack Query is wired globally through `QueryClientProvider` in `src/main.tsx`.
- Zustand and Zod are installed and ready to use when the first store or schema is added.
