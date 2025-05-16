# CeLesteCMS Pro: Architecture & Framework Components

## Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| [Svelte](https://svelte.dev/) | 5.28.2 | Core UI framework with reactive components |
| [SvelteKit](https://kit.svelte.dev/) | 2.20.8 | Full-stack framework for building web applications |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3 | Static typing for JavaScript |
| [Vite](https://vitejs.dev/) | 6.3.5 | Next generation frontend tooling and dev server |

## UI & Design

| Package | Version | Purpose |
|---------|---------|---------|
| [TailwindCSS](https://tailwindcss.com/) | 4.1.6 | Utility-first CSS framework |
| [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | 0.5.16 | Typography plugin for Tailwind |

## Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| [@libsql/client](https://github.com/libsql/libsql-client-js) | 0.15.4 | Client for LibSQL/Turso databases |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.43.1 | TypeScript ORM for SQL databases |
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
| [@inlang/paraglide-js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) | 2.0.12 | Type-safe i18n solution optimized for SvelteKit |

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

### Frontend Architecture
CeLesteCMS Pro uses a component-based architecture powered by Svelte 5, with SvelteKit providing the full-stack framework capabilities. The UI is built using TailwindCSS for a consistent and utility-first design system.

### Backend Architecture
The backend is implemented using SvelteKit server endpoints, which provide API functionality. Data persistence is handled through Drizzle ORM connecting to Cloudflare D1 or other SQL databases via the LibSQL client.

### Content Management
Content can be authored in Markdown using MDSvex, which allows embedding Svelte components directly within markdown content. This creates a powerful authoring experience that combines the simplicity of markdown with the interactivity of Svelte.

### Internationalization
The application supports multiple languages through Paraglide, with built-in support for English (en) and Portuguese Brazil (pt-BR).

### Deployment Strategy
The application is designed to be deployed to Cloudflare Pages using the Cloudflare adapter, providing global distribution and edge computing capabilities.

### Development Workflow
The development workflow is supported by a comprehensive set of tools:
- Vite for fast development and building
- TypeScript for type safety
- ESLint and Prettier for code quality
- Vitest and Playwright for testing
- Storybook for component development and documentation

### Database Schema Management
Database schema and migrations are managed through Drizzle Kit, providing type-safe database operations and schema versioning.
