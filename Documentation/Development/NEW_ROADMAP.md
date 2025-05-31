# CeLesteCMS Pro Unified Roadmap

This roadmap merges the high-level, outcome-driven approach of the new roadmap suggestion with the actionable detail of Development.md. It is structured to ensure a focused MVP delivery, prevent scope creep, and provide a clear path for future enhancements.

---

## PHASE 1: MVP (Minimum Viable Product)
**Goal:** Deliver a performant, static-generated blog with an admin UI, basic authentication, and essential content management. No dynamic/cloud frontend, advanced plugins, or agency features in MVP.

### Core Deliverables
- Static Site Generation (SSG) for all blog posts (SvelteKit adapter-static)
- Admin UI (SvelteKit 5, TailwindCSS v4, dark mode)
- Basic authentication (Better Auth integration)
- Content management: schemas, markdown editor, REST API
- Basic SEO: unique meta tags, sitemap.xml
- Minimal client-side hydration (only for interactivity, e.g. comments)
- **Database:**
  - Local development: SQLite (chosen for compatibility with Cloudflare D1) for fast, simple local/dev runs
  - Production: Cloudflare D1 for deployment
  - This ensures seamless development and deployment, as both environments use a similar SQL interface.
- **Deployment:** Output is always to Cloudflare Pages (CL Pages) for both preview and production
- Initial plugin/extension foundation (but not full system)

### MVP Task Tracking
- All MVP tasks are tracked in `Development.md` (see that file for up-to-date progress and checklists)

### Explicitly Out of Scope for MVP
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
**Goal:** Expand CMS capabilities based on user feedback and real-world needs. Add features for agencies, teams, and advanced users.

### Major Features
- Multi-site management
- Team collaboration, roles & permissions
- Advanced plugin/extension system (marketplace, lifecycle, component extension)
- Enhanced content editing (WYSIWYG, page builder, real-time preview)
- Advanced SEO (Open Graph, Schema.org, RSS/Atom feeds)
- Application marketplace foundation
- Dynamic application routing
- Application component library
- Developer SDK and documentation

### Release Management & Distribution
**Goal:** Establish professional release workflow for beta versions and beyond.

#### 2.0 GitHub Releases Implementation
- **First Beta Release** (v0.1.0-beta) with proper GitHub Release
- **Semantic versioning** enforcement with automated version bumping
- **Release notes automation** from CHANGELOG.md integration
- **Pre-release vs stable** release management for different audiences

#### 2.1 GitHub Actions Automation
- **Automated testing** on pull requests and main branch
- **Automated building** and deployment to staging environments
- **Release automation** with tag-based deployments
- **Security scanning** and dependency vulnerability checks
- **Performance testing** and lighthouse score tracking

**GitHub Actions Implementation Strategy:**
```
Phase 2 Workflow Setup Order:
1. Basic CI (lint, type-check, build)
2. Security scanning (audit, CodeQL)  
3. Auto-deployment to staging
4. Release automation
5. Performance monitoring
6. Advanced features (matrix, caching)
```

**Why Phase 2 (Not Alpha):**
- ✅ **Alpha Focus**: Time better spent building core features
- ✅ **Stability First**: Implement CI/CD when APIs are stable
- ✅ **Team Collaboration**: Most valuable when multiple contributors join
- ✅ **Professional Image**: Shows maturity for beta releases
- ✅ **Quality Gates**: Prevent regressions in stable codebase

#### 2.2 Distribution & Downloads
- **Release asset management** with downloadable builds
- **Version comparison links** and automated changelog generation
- **Release notifications** for followers and contributors
- **Beta testing program** with structured feedback collection

### Authentication & Security Enhancements
**Goal:** Enhance the basic authentication system with production-ready features, monitoring, and admin controls.

#### 2.1 Security & Protection
- **Rate limiting protection** for password reset attempts (max 3 attempts per IP per hour)
- **Enhanced token security** with configurable expiration times and stronger generation
- **Comprehensive audit logging** for all authentication events (login attempts, password resets, admin actions)
- **Admin security dashboard** with authentication metrics, failed attempt monitoring, and user activity insights

#### 2.2 User Experience Improvements
- **Enhanced email templates** with company branding, custom styling, and responsive design
- **Better user feedback** with improved success/error messages and helpful guidance
- **Email preview dashboard** for development and testing of email templates
- **Multi-language support** for authentication emails and user-facing messages

#### 2.3 Production Email System
- **Production email providers** integration (Resend, Gmail SMTP, AWS SES)
- **Email delivery monitoring** with retry mechanisms and delivery status tracking
- **Environment-based configuration** for seamless development-to-production workflows
- **Email template management** system with versioning and A/B testing capabilities

#### 2.4 Development & Testing Tools
- **Enhanced testing tools** for complete authentication flow validation
- **Email debugging utilities** with better console output and email content inspection
- **Improved error handling** with cleaner logging and development-friendly error messages
- **Automated testing suite** for password reset flows and security vulnerability detection

---

## PHASE 3: Cloud/SSR & Hosting Provider Integration
**Goal:** Enable dynamic, scalable deployments and integrations with hosting providers.

### Major Features
- Cloud/SSR frontend option (dynamic content updates, on-demand revalidation)
- White-labeling capabilities
- Control panel integrations
- Automated deployment tools (one-click, env config, CI/CD)
- Multi-tenant application support
- Cloudflare D1 advanced features, asset optimization
- Monitoring and analytics integration
- Application scaling capabilities

---

## Guiding Principles
- **Strict MVP focus:** No features beyond the MVP list until after launch.
- **User feedback:** Post-MVP priorities are set by real-world usage and feedback.
- **Agile iteration:** Each phase is planned in detail only after the previous phase is stable.
- **Modern stack:** SvelteKit 5, TailwindCSS v4, Drizzle ORM, Cloudflare D1/Pages, Better Auth.

---

## Appendix: Quick Reference Table

| Feature/Goal              | MVP (Phase 1) | Post-MVP (Phase 2) | Cloud/SSR (Phase 3) |
|--------------------------|:-------------:|:------------------:|:-------------------:|
| SSG Blog                 |      ✅       |         —          |         —           |
| Admin UI (SvelteKit)     |      ✅       |         ✅         |         ✅           |
| Auth System              |      ✅       |         ✅         |         ✅           |
| Auth Enhancements        |      —        |         ✅         |         ✅           |
| Plugin System            |   Foundation  |     Full System    |         ✅           |
| Advanced SEO             |      —        |         ✅         |         ✅           |
| Agency/Multi-site        |      —        |         ✅         |         ✅           |
| Cloud/SSR Frontend       |      —        |         —          |         ✅           |
| Cloudflare/D1            |      ✅       |         ✅         |         ✅           |
| User Feedback-Driven     |      —        |         ✅         |         ✅           |
| One-click Deploy/CI/CD   |      —        |         —          |         ✅           |

---

This roadmap is designed to keep the MVP lean and shippable, while providing a clear, actionable path for future growth and advanced features.
