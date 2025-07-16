# Changelog

All notable changes to CeLesteCMS Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Note**: CeLesteCMS Pro is currently in **Alpha** development. All versions below 1.0.0 are considered alpha releases with breaking changes possible between versions.

## [Unreleased]

### Added
- **Framework Modernization (COMPLETED)** - All frameworks updated to 2025 best practices
  - **SvelteKit 2.22.5** - Latest with WebSocket support, async routing, Vite 7 compatibility
  - **Svelte 5.35.6** - Complete runes implementation ($state, $effect, $derived)
  - **TailwindCSS 4.1.11** - CSS-first configuration with Oxide engine performance
  - **DaisyUI 5.0.46** - Modern theme system with TailwindCSS 4 compatibility
  - **Drizzle ORM 0.44.2** - Latest with 2025 features and optimal SQLite config
  - **Paraglide i18n 2.2.0** - Modernized flat message structure and universal i18n

### Changed
- **Message Structure** - Migrated from nested to flat semantic naming
  - Old: `m["userMenu.profile"]()` → New: `m.user_menu_profile()`
  - Applied consistently across all components for better performance
  - Improved developer experience with cleaner, more predictable naming
- **Theme Management** - Updated to use modern DaisyUI data-theme attributes
- **Component Patterns** - All components now use consistent Svelte 5 runes

### Removed
- **Legacy Configuration** - Removed `tailwind.config.js` (replaced by CSS-first approach)
- **Nested Message Structure** - Deprecated in favor of flat semantic naming

### Technical
- **Universal Reactivity** - Svelte 5 runes work across all components
- **Fine-grained Updates** - Signals-based reactivity for optimal performance
- **Type Safety** - Full TypeScript integration across all frameworks
- **Future-Proof** - All frameworks aligned with 2025 development standards

### Planned
- Route guards for protected admin pages
- Role-based access control (admin, editor, etc.)
- User management functionality
- Content management pages (posts, users, media)
- Static site generation implementation
- Basic SEO features
- Plugin foundation architecture

## [0.0.12-alpha] - 2025-05-31

### Fixed
- **Paraglide 2.0 Compatibility** - Fixed TypeError: languageTag is not a function
  - Updated LanguageSwitcher component to use new Paraglide 2.0 API
  - Replaced deprecated `languageTag()` with `getLocale()`
  - Replaced deprecated `setLanguageTag()` with `setLocale()`
  - Replaced deprecated `availableLanguageTags` with `locales` array
  - All localization now working correctly with Paraglide 2.0 + Svelte 5

### Changed
- **Login Button Text** - Updated from "Sign In" to "Login" in English messages
- **Admin UI Consistency** - Improved visual consistency across all authentication pages:
  - Standardized navbar layout across login, signup, forgot-password, and reset-password pages
  - Added proper margins to navigation corners for better spacing
  - Centered icons vertically in navbar for improved alignment
  - Enhanced overall user experience with consistent design patterns

### Added
- **Utility Script** - Added `clear-cache.sh` for development workflow optimization

### Developer Experience
- Resolved Svelte 5 + Paraglide 2.0 integration issues
- Improved development workflow with proper localization setup
- Enhanced UI consistency reduces maintenance overhead

## [0.0.11-alpha] - 2025-05-30

### Added
- **Complete Password Reset System** with pluggable email providers
- Forgot password page (`/admin/forgot-password`) with accessible form design
- Reset password page (`/admin/reset-password`) with real-time validation
- **Email Service Architecture** with development-friendly providers:
  - Console provider for development (logs emails to console)
  - File provider for testing (saves emails to `./email-logs/`)
  - Base interface for future production providers (Resend, Gmail, SES)
- Password strength indicator with visual feedback
- Secure token generation with 1-hour expiration using CUID2
- Beautiful HTML email templates with responsive design
- Email testing script (`test-email.ts`) and npm script (`pnpm test:email`)
- Comprehensive password reset documentation (`PASSWORD_RESET_GUIDE.md`)

### Changed
- Updated database schema to use `verification` table for reset tokens
- Enhanced `.env.example` with email configuration options
- Added `bcrypt` and `@types/bcrypt` dependencies for secure password hashing

### Security
- **Universal password reset** - all users including admins can reset passwords
- **No email enumeration** - always shows success message regardless of email existence
- **Secure token cleanup** - automatic cleanup after use and expiration
- **bcrypt password hashing** with 12 salt rounds
- **Server-side validation** for all password reset inputs
- **CSRF protection** via SvelteKit form actions

### Fixed
- Resolved accessibility warnings in reset password form (proper label associations)
- Fixed bcrypt native compilation issues with proper dependency installation

### Developer Experience
- **Zero external dependencies** for development - works immediately with console provider
- **Clear development path** to production email providers
- **Comprehensive testing tools** and documentation
- **Error-free development workflow** with proper environment configuration

## [0.0.10-alpha] - 2025-05-28

### Changed
- Updated Better Auth session configuration to use recommended defaults:
  - `expiresIn`: Changed from 2 hours to 7 days (604800 seconds)
  - `updateAge`: Changed from 30 minutes to 1 day (86400 seconds)
  - Cookie cache maxAge maintained at 5 minutes
- Login form now saves remember me preference to localStorage on successful login
- onMount function updated to load remember me preference instead of stored email

### Fixed
- Fixed remember me checkbox state persistence in login form
- Removed legacy email storage from localStorage for security reasons
- Implemented proper remember me preference storage in localStorage
- Checkbox now correctly reflects user's previous preference on page load

### Security
- Browser autofill now handles email field securely instead of localStorage
- Improved security by removing plain text email storage in localStorage
- Remember me sessions now last 7 days with daily refresh for active users
- Sessions persist through browser restarts only when "remember me" is checked

## [0.0.9-alpha] - 2025-05-23

### Added
- Created standalone database seed script (`seed-standalone.ts`) to bypass SvelteKit dependency issues
- Created standalone database test script (`test-db-standalone.ts`) for testing database functionality
- Added custom database CLI script (`db-cli.ts`) for interactive database management
- Added sample data via SQLite CLI:
  - Admin user: `admin@example.com` with bcrypt-hashed password
  - 3 sample posts with different statuses (published, draft, featured)
  - General category and Post content type
  - Proper relationships between posts, categories, and tags
- Added new package.json scripts:
  - `db:seed-standalone` - Standalone seeding without SvelteKit dependencies
  - `test:db` - Database testing and sample data creation
  - `db:cli` - Interactive database CLI (requires Node.js version compatibility)

### Changed
- Updated Next Steps documentation with Phase 1a completion status
- Updated HISTORY.md to version 0.0.9 with database foundation milestone
- Switched from Drizzle's SvelteKit-dependent scripts to standalone SQLite CLI approach

### Fixed
- Fixed SvelteKit environment dependency issues in database scripts
- Resolved `$env/dynamic/private` import errors when running seed scripts outside SvelteKit context
- Addressed better-sqlite3 binding compatibility issues with Node.js v23.7.0
- Resolved better-sqlite3 native binding issues for Node.js v23.7.0

## [0.0.8-alpha] - 2025-05-21

### Added
- Added distinctive background color to active sidebar menu items for better navigation
- Added 4px spacing between sidebar menu items for improved readability

### Changed
- Archived original admin implementation and replaced it with improved DaisyUI-based dashboard
- Updated Next Steps documentation with implementation strategy for database, authentication, and content pages

## [0.0.7-alpha] - 2025-05-20

### Added
- Enhanced admin dashboard UI using DaisyUI components
- Added "Add Post" button to Recent Posts section
- Implemented DaisyUI status indicators in System Status section
- Created more detailed translations for dashboard UI elements
- Added full translations for user profile dropdown menu

### Changed
- Converted stat cards to DaisyUI card components with improved layout
- Redesigned Recent Posts section with three-line format for better readability
- Reformatted Recent Activity section to display activity type in small primary-colored text
- Updated System Status section with semantic status indicators inside badges
- Improved dark mode styling with consistent borders and backgrounds

### Fixed
- Fixed dropdown behavior in language switcher using document.activeElement.blur()
- Fixed language switcher dropdown to properly close when a language is selected
- Addressed inconsistent UI styling across different dashboard sections
- Ensured proper text wrapping in card components for better responsiveness

## [0.0.6-alpha] - 2025-05-18

### Added
- Added CeLesteCMS logo to the login card
- Added support contact information to form footer
- Documented UI styling issues in KNOWN_BUGS.md for future refinement

### Changed
- Login page UI completely redesigned using DaisyUI components
- Updated login form with improved styling and modern appearance
- Updated form text and button labels for better UX
- Changed form footer to include support contact information
- Original login page backed up to Archive folder

## [0.0.5-alpha] - 2025-05-17

### Added
- Implemented UI components from Archive for baseline implementation
- Created authentication framework with login/logout functionality
- Added admin dashboard layout with sidebar navigation
- Implemented component library in src/lib/components folder
- Set up internationalization with English and Portuguese support
- Implemented dark mode toggle across all components
- Added AuthCard, Card, and StatCard components for UI structure
- Created SidebarItem, ActivityItem, and ContentItem components for dashboard

### Changed
- Updated HISTORY.md with version 0.0.5 milestone
- Configured Tailwind CSS with custom color palette
- Removed temporary DaisyUI integration for stable baseline UI first

## [0.0.4-alpha] - 2025-05-16

### Added
- API test endpoint created at /api/test-db to validate database operations
- New documentation files added:
  - Documentation/Architecture/Plugins.md
  - Documentation/Architecture/HeadlessAPI/Plugins/RSS Feeds
  - Documentation/Development/AI Automation Add-On (CeLesteCMS Pro Exclusive).md
  - Documentation/Development/AI Automation Add-On Tech preview

### Changed
- Database implementation fully tested and verified
- SQLite database successfully configured with D1 compatibility

## [0.0.3-alpha] - 2025-05-15

### Added
- Implemented comprehensive database schema with Drizzle ORM
- Created relations between tables (users, content, media)
- Added CUID2 for unique ID generation
- Configured SQLite for local development with D1 compatibility
- Created VERSIONING.md to document version strategy
- TypeScript interfaces for database models defined
- Relations between all tables established

### Changed
- Enhanced schema with comprehensive user, content, and media management tables
- Updated HISTORY.md with database implementation milestone
- Configured TailwindCSS with DaisyUI themes

## [0.0.2-alpha] - 2025-05-15

### Added
- TailwindCSS v4 configured with DaisyUI components and custom themes
- Core packages installed and version compatibility confirmed

## [0.0.1-alpha] - 2025-05-15

### Added
- Created Archive folder to store previous implementation
- Organized Documentation folder into logical categories
- Created HISTORY.md and CHANGELOG.md to track project decisions and changes
- Updated README.md with more detailed technology stack information:
  - Added SQLite for local development with D1 compatibility
  - Clarified use of TailwindCSS v4 with DaisyUI components
  - Added Cloudflare Workers alongside Pages
  - Added internationalization with @inlang/paraglide-js
  - Added development workflow details
- SvelteKit project initialized with:
  - SvelteKit minimal template
  - TypeScript support
  - Prettier and ESLint for code quality
  - Drizzle ORM for database
  - Paraglide.js for internationalization
  - SvelteKit adapter for deployment
- Pnpm installed and configured as default package manager

### Changed
- Project structure reset to enable a clean implementation
- Preserved Documentation folder and essential project files
- Updated README.md to reflect current technology decisions

## Development Phases

### Phase 1: MVP Development
- **Phase 1a**: Database Foundation - ✅ **COMPLETE** (v0.0.9)
- **Phase 1b**: Authentication System - ✅ **COMPLETE** (v0.0.11) - Universal password reset system
- **Phase 1c**: Content Management - 📋 **PLANNED**
- **Phase 1d**: Static Site Generation - 📋 **PLANNED**

### Phase 2: Enhanced Features (Planned)
- Enhanced session management improvements
- Role-based access control (admin, editor, author, subscriber)
- Two-factor authentication
- Production email providers (Resend, Gmail, SES)
- Rate limiting and security enhancements

### Phase 3: Advanced Features (Planned)
- Plugin architecture
- AI automation features
- Advanced SEO tools
- Multi-site management

---

## Links

[Unreleased]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.12-alpha...HEAD
[0.0.12-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.11-alpha...v0.0.12-alpha
[0.0.11-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.10-alpha...v0.0.11-alpha
[0.0.10-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.9-alpha...v0.0.10-alpha
[0.0.9-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.8-alpha...v0.0.9-alpha
[0.0.8-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.7-alpha...v0.0.8-alpha
[0.0.7-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.6-alpha...v0.0.7-alpha
[0.0.6-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.5-alpha...v0.0.6-alpha
[0.0.5-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.4-alpha...v0.0.5-alpha
[0.0.4-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.3-alpha...v0.0.4-alpha
[0.0.3-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.2-alpha...v0.0.3-alpha
[0.0.2-alpha]: https://github.com/Discerneco/CeLesteCMSPro/compare/v0.0.1-alpha...v0.0.2-alpha
[0.0.1-alpha]: https://github.com/Discerneco/CeLesteCMSPro/releases/tag/v0.0.1-alpha
