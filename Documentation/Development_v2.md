# CeLesteCMS Pro Development (v2)

This version of the development checklist is fully aligned with the unified roadmap in `NEW_ROADMAP.md`. It strictly separates MVP from post-MVP work, clarifies dev/prod database use, and avoids scope creep.

---

## PHASE 1: MVP (Minimum Viable Product)
**Goal:** Deliver a performant, static-generated blog with robust admin UI, authentication, and essential content management. No dynamic frontend, advanced plugins, or agency features.

### Actionable Development Tasks

#### 1. Static Site Generation (SSG) for Blog
- [ ] Set up SvelteKit project with adapter-cloudflare
- [ ] Configure SSG for all blog routes
- [ ] Implement prerendering for blog post pages
- [ ] Ensure SSG output is compatible with Cloudflare Pages

#### 2. Admin UI (SvelteKit 5, TailwindCSS v4, dark mode)
- [ ] Scaffold admin dashboard route (`/admin`)
- [ ] Use Svelte 5 runes for state management
- [ ] Integrate TailwindCSS v4 and configure dark mode
- [ ] Build sidebar navigation and responsive layout
- [ ] Implement stats cards, system status, content sections
- [ ] Add language switcher (English/Portuguese)
- [ ] Add dark/light mode toggle
- [ ] Ensure modern, accessible UI with proper spacing and alignment

#### 3. Authentication (Better Auth integration)
- [ ] Integrate Better Auth for login/registration
- [ ] Implement login form with Svelte 5 runes and TailwindCSS
- [ ] Add password visibility toggle and form validation
- [ ] Handle authentication errors and session management

#### 4. Content Management
- [ ] Define content schemas with Drizzle ORM (pages, posts)
- [ ] Implement markdown editor for blog posts
- [ ] Create REST API endpoints for content delivery (SvelteKit endpoints)
- [ ] Add file/media upload support (if in MVP scope)

#### 5. Basic SEO
- [ ] Add unique meta tags per page (title, description)
- [ ] Generate sitemap.xml at build time
- [ ] Ensure SSG output is SEO-friendly

#### 6. Minimal Client-side Hydration
- [ ] Only hydrate necessary interactive components (e.g. comments widget)
- [ ] Ensure most blog content is static HTML

#### 7. Database Setup
- [ ] Configure local development to use SQLite (schema compatible with D1)
- [ ] Configure production to use Cloudflare D1
- [ ] Write migration scripts for both environments

#### 8. Deployment
- [ ] Set up deployment pipeline to Cloudflare Pages (preview and production)
- [ ] Document deployment process for developers

#### 9. Plugin/Extension Foundation
- [ ] Implement basic hooks or extension points in the admin/content system
- [ ] Document how future plugins/extensions will be registered

#### 10. MVP Documentation
- [ ] Write developer onboarding guide
- [ ] Document content model and API
- [ ] Document local dev and deployment process


#### Explicitly Out of Scope for MVP
- Dynamic SSR/cloud frontend
- Advanced plugin system (marketplace, lifecycle, extension points)
- Agency/multi-site features
- Advanced SEO (Open Graph, structured data, RSS)
- Rich text/WYSIWYG editing
- Granular roles/permissions
- SaaS/white-label/multi-tenant features
- One-click deployment tools, CI/CD, analytics

---

## PHASE 2: Post-MVP & Agency Features
- [ ] Multi-site management
- [ ] Team collaboration, roles & permissions
- [ ] Advanced plugin/extension system (marketplace, lifecycle, component extension)
- [ ] Enhanced content editing (WYSIWYG, page builder, real-time preview)
- [ ] Advanced SEO (Open Graph, Schema.org, RSS/Atom feeds)
- [ ] Application marketplace foundation
- [ ] Dynamic application routing
- [ ] Application component library
- [ ] Developer SDK and documentation

---

## PHASE 3: Cloud/SSR & Hosting Provider Integration
- [ ] Cloud/SSR frontend option (dynamic content updates, on-demand revalidation)
- [ ] White-labeling capabilities
- [ ] Control panel integrations
- [ ] Automated deployment tools (one-click, env config, CI/CD)
- [ ] Multi-tenant application support
- [ ] Cloudflare D1 advanced features, asset optimization
- [ ] Monitoring and analytics integration
- [ ] Application scaling capabilities

---

## Guiding Principles
- Strict MVP focus: no features beyond the MVP list until after launch.
- User feedback: post-MVP priorities set by real-world usage and feedback.
- Modern stack: SvelteKit 5, TailwindCSS v4, Drizzle ORM, Cloudflare D1/Pages, Better Auth.

Refer to `NEW_ROADMAP.md` for phase rationale and boundaries.
