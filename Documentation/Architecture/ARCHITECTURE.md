# CeLesteCMS Pro: Architecture & Framework Components

## Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| [Svelte](https://svelte.dev/) | 5.35.6 | Core UI framework with runes reactivity system |
| [SvelteKit](https://kit.svelte.dev/) | 2.22.5 | Full-stack framework with WebSocket support and async routing |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3 | Static typing for JavaScript |
| [Vite](https://vitejs.dev/) | 6.3.5 | Next generation frontend tooling and dev server |

## UI & Design

| Package | Version | Purpose |
|---------|---------|---------|
| [TailwindCSS](https://tailwindcss.com/) | 4.1.11 | Utility-first CSS framework with Oxide engine |
| [DaisyUI](https://daisyui.com/) | 5.0.46 | Modern component system with transparent styling |
| [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | 0.5.16 | Typography plugin for Tailwind |

## Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| [@libsql/client](https://github.com/libsql/libsql-client-js) | 0.15.4 | Client for LibSQL/Turso databases |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.44.2 | TypeScript ORM with 2025 features and optimal SQLite config |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | 0.31.1 | CLI companion for Drizzle ORM |

## Deployment & Hosting

| Package | Version | Purpose |
|---------|---------|---------|
| [@sveltejs/adapter-cloudflare](https://kit.svelte.dev/docs/adapter-cloudflare) | 7.0.3 | SvelteKit adapter for Cloudflare Pages/Workers |

## Content Authoring

| Package | Version | Purpose |
|---------|---------|---------|
| [MDSvex](https://mdsvex.com/) | 0.12.6 | Markdown preprocessor for Svelte |

## Internationalization

| Package | Version | Purpose |
|---------|---------|---------|
| [@inlang/paraglide-js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) | 2.2.0 | Universal i18n with flat message structure |

## Testing & Quality Assurance

| Package | Version | Purpose |
|---------|---------|---------|
| [Vitest](https://vitest.dev/) | 3.1.3 | Unit and component testing framework |
| [Playwright](https://playwright.dev/) | 1.52.0 | End-to-end testing framework |
| [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) | 5.2.7 | DOM testing utilities for Svelte |
| [ESLint](https://eslint.org/) | 9.26.0 | Code linting |
| [Prettier](https://prettier.io/) | 3.5.3 | Code formatting |
| [svelte-check](https://github.com/sveltejs/svelte-check) | 4.1.7 | Static analysis for Svelte components |

## Development Tools

| Package | Version | Purpose |
|---------|---------|---------|
| [Storybook](https://storybook.js.org/) | 8.6.12 | UI component explorer and documentation |
| [@storybook/svelte](https://storybook.js.org/docs/svelte/get-started/install) | 8.6.12 | Storybook for Svelte components |
| [@storybook/sveltekit](https://storybook.js.org/docs/svelte/get-started/install) | 8.6.12 | Storybook integration for SvelteKit |

## Architecture Overview

### Hybrid Static/Dynamic Architecture
CeLesteCMS Pro uses a modern hybrid architecture that combines static site generation with dynamic server-side features:
- **Static Public Site**: Pre-rendered blog posts and pages for optimal performance
- **Dynamic Admin Panel**: Server-side rendered admin interface with real-time updates
- **Headless API**: RESTful endpoints for content delivery and external integrations
- **Edge Functions**: Dynamic features like comments and search on static pages

### Frontend Architecture
CeLesteCMS Pro uses a component-based architecture powered by Svelte 5 with runes ($state, $effect, $derived), providing fine-grained reactivity. SvelteKit handles both static generation and server-side rendering. The UI is built using TailwindCSS 4 with DaisyUI components for consistent, modern design.

### Backend Architecture
The backend provides dual functionality:
- **Static Generation**: Pre-builds public pages at build time
- **Dynamic API**: SvelteKit server endpoints for admin operations and headless consumption
- **Authentication**: Oslo + Arctic secure authentication with session management
- **Database**: Drizzle ORM with SQLite (development) and Cloudflare D1 (production)

### Content Management
Content can be authored in Markdown using MDSvex, which allows embedding Svelte components directly within markdown content. This creates a powerful authoring experience that combines the simplicity of markdown with the interactivity of Svelte.

### Authentication System
Secure authentication powered by Oslo + Arctic:
- **Oslo**: Cryptographic utilities for password hashing and session management
- **Arctic**: OAuth providers integration for social authentication
- **Session Management**: HTTP-only cookies with proper expiration
- **Route Protection**: Server-side guards for admin pages

### Internationalization
The application supports multiple languages through Paraglide 2.2.0, with universal i18n and flat message structure for English (en) and Portuguese Brazil (pt-BR).

### Headless API Capabilities
CeLesteCMS Pro provides a complete headless CMS experience:
- **Content API**: Public endpoints for consuming content in external applications
- **Admin API**: Protected endpoints for content management
- **RESTful Design**: Standard HTTP methods and status codes
- **CORS Support**: Configurable cross-origin access for external consumption

### Deployment Strategy
Hybrid deployment using Cloudflare Pages with `adapter-cloudflare`:
- **Static Assets**: Pre-rendered public pages served from CDN
- **Edge Functions**: Dynamic API endpoints and admin functionality
- **Global Distribution**: Edge computing with automatic scaling
- **D1 Database**: Serverless SQLite database with global replication

### Development Workflow
The development workflow is supported by a comprehensive set of tools:
- Vite for fast development and building
- TypeScript for type safety
- ESLint and Prettier for code quality
- Vitest and Playwright for testing
- Storybook for component development and documentation

### Database Schema Management
Database schema and migrations are managed through Drizzle Kit, providing type-safe database operations and schema versioning.
