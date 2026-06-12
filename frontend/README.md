# Makerspace — Vite + React JSX

Converted from TanStack Start (SSR) to a standard **Vite + React** client-side project.

## Stack

- **Vite** — build tool & dev server
- **React 19** — UI library
- **TanStack Router** — file-based routing
- **TanStack Query** — data fetching
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — component library (Radix UI + CVA)
- **Lucide React** — icons

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── index.html              # HTML entry point
├── vite.config.js          # Vite configuration
├── package.json
└── src/
    ├── main.jsx            # App entry point
    ├── router.jsx          # TanStack Router setup
    ├── routeTree.gen.js    # Auto-generated route tree (do not edit)
    ├── styles.css          # Global styles + Tailwind
    ├── components/
    │   ├── TopNav.jsx
    │   ├── SectionPage.jsx
    │   ├── collaboration/
    │   ├── community/
    │   ├── events/
    │   └── ui/             # shadcn/ui components
    ├── hooks/
    │   └── use-mobile.jsx
    ├── lib/
    │   ├── utils.js
    │   ├── events-data.js
    │   ├── community-data.js
    │   ├── collaboration-data.js
    │   └── api/
    └── routes/
        ├── __root.jsx      # Root layout with TopNav
        ├── index.jsx       # / (home)
        ├── events.index.jsx
        ├── events.$eventId.jsx
        ├── community.index.jsx
        ├── community.$postId.jsx
        ├── collaboration.index.jsx
        └── collaboration.$postId.jsx
```

## Notes

- The `@` alias resolves to `./src` (configured in `vite.config.js`)
- This project uses **Tailwind CSS v4** — no `tailwind.config.js` needed; config lives in `styles.css`
- Route files use TanStack Router's `createFileRoute` convention
