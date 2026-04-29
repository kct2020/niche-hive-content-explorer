# Cloudflare Workers Full-Stack Boilerplate

[cloudflarebutton]

A production-ready, full-stack application template powered by Cloudflare Workers. Features a modern React frontend with shadcn/ui, Tailwind CSS, and a robust backend using Durable Objects for stateful, multi-tenant storage. Includes real-time chat functionality with users and chat boards as a demo, ready for your custom app.

## Features

- **Edge-Native Full-Stack**: Single deployment for frontend and API on Cloudflare's global network.
- **Durable Objects**: Multi-tenant storage for entities (Users, Chats) with indexing and ACID transactions.
- **Modern React App**: Vite + React 18 + TypeScript + shadcn/ui + Tailwind CSS.
- **Type-Safe API**: Hono routing with Zod validation-ready structure.
- **Data Management**: TanStack Query for optimistic updates and caching.
- **Beautiful UI**: Dark mode, responsive design, animations, glassmorphism effects.
- **Developer Experience**: Hot reload, Bun scripts, ESLint, error boundaries.
- **Production-Ready**: CORS, logging, health checks, client error reporting.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, TanStack Query, Sonner (toasts), Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects (SQLite-backed).
- **State & Utils**: Zustand, Immer, clsx, class-variance-authority.
- **Build Tools**: Bun, Wrangler, Cloudflare Vite plugin.
- **UI Components**: Radix UI primitives, Headless UI, React Hook Form, Recharts.

## Quick Start

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Run Development Server**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`).

3. **Build for Production**:
   ```bash
   bun build
   ```

## Development

- **Type Generation**: `bun cf-typegen` (generates Worker types).
- **Linting**: `bun lint`.
- **Preview Build**: `bun preview`.
- **Hot Reload**: Frontend auto-reloads; Worker updates on save (via `user-routes.ts`).

### Project Structure

```
├── src/              # React app (pages, components, hooks, lib)
├── worker/           # Cloudflare Worker (routes, entities, utils)
├── shared/           # Shared types
└── public/           # Static assets
```

- **Frontend Customization**: Edit `src/pages/HomePage.tsx` and components.
- **Backend Entities**: Extend `worker/entities.ts` (Users, Chats demo included).
- **API Routes**: Add to `worker/user-routes.ts` (auto-loaded).
- **Demo Data**: Seeded on first API call (`/api/users`, `/api/chats`).

### API Examples

Fetch users (paginated):
```
GET /api/users?limit=10&cursor=abc
```

Create chat:
```
POST /api/chats { "title": "My Chat" }
```

Send message:
```
POST /api/chats/:chatId/messages { "userId": "u1", "text": "Hello" }
```

Full OpenAPI docs auto-generated in dev mode at `/api/docs`.

## Deployment

Deploy to Cloudflare Workers with one command:

```bash
bun deploy
```

Or use Wrangler directly:
```bash
npx wrangler deploy
```

### Requirements
- [Cloudflare Account](https://dash.cloudflare.com) with Workers enabled.
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/): `bun add -g wrangler`.
- Login: `wrangler login`.

The app deploys as a single Worker with:
- Static assets from `dist/` (Vite build).
- Durable Objects for storage (auto-migrates).
- Custom domain support via `wrangler.toml`.

[cloudflarebutton]

## Customization

- **Entities**: Extend `IndexedEntity` in `worker/entities.ts`.
- **Routes**: `worker/user-routes.ts` (Hono app).
- **UI**: shadcn components in `src/components/ui/`; add via `npx shadcn-ui@latest add <component>`.
- **Theme**: Edit `tailwind.config.js` and `src/index.css`.
- **Env Vars**: Add to `wrangler.toml` under `[vars]`.

## Troubleshooting

- **Worker Routes Fail**: Check console for `user-routes.ts` errors.
- **Types Missing**: Run `bun cf-typegen`.
- **CORS Issues**: Pre-configured for `*` in dev.
- **Storage Reset**: Delete Durable Object namespaces in dashboard.

## License

MIT. See [LICENSE](LICENSE) for details.