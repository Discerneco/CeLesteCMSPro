# CeLesteCMS Pro - Claude Development Guide

## Project Overview

CeLesteCMS Pro is a modern, headless CMS built with cutting-edge web technologies, designed for static site generation with an intuitive admin interface. The project leverages the latest 2025 framework implementations and best practices.

## Current Status: ~50% MVP Complete - TypeScript Foundation Solid ✅

### ✅ **Completed Components**

#### Infrastructure & Framework Stack
- **SvelteKit 2.22.5** - Latest with WebSocket support, async routing, Vite 7 compatibility
- **Svelte 5.35.6** - Complete runes implementation ($state, $effect, $derived)
- **TailwindCSS 4.1.11** - CSS-first configuration with Oxide engine performance
- **DaisyUI 5.0.46** - Modern component system with transparent styling
- **Drizzle ORM 0.44.2** - Latest with 2025 features and optimal SQLite config
- **Paraglide i18n 2.2.0** - Universal localization with flat message structure

#### Authentication System (Oslo + Arctic) ✅
- Secure password hashing with Oslo SHA-256 cryptographic utilities
- Session management with HTTP-only cookies and proper expiration
- Complete authentication flow (login, logout, session persistence)
- Route protection for admin pages via hooks.server.ts
- Admin user creation and management scripts (seed-standalone.ts)
- Clean API endpoints with proper TypeScript types
- **Status**: Fully functional, zero TypeScript errors

#### Admin UI Framework
- Responsive dashboard with light/dark theme switching
- Modern DaisyUI component architecture with transparent badge styling
- Bilingual support (English/Portuguese) with flat message structure
- Consistent Svelte 5 runes patterns across all components
- Type-safe component props and state management

#### Database Architecture ✅
- Comprehensive schema: users, sessions, posts, categories, tags, media, settings
- Full relational design with foreign key constraints
- TypeScript integration with Drizzle ORM (zero compilation errors)
- SQLite development with Cloudflare D1 production compatibility
- Database migration and seeding capabilities (Oslo-compatible)
- **Status**: Schema complete, properly typed, functional seed scripts

#### Phase 1 Complete: TypeScript Foundation ✅
- **MILESTONE**: Zero TypeScript compilation errors achieved
- **Clean Codebase**: All obsolete Better Auth remnants removed
- **Oslo Integration**: SHA-256 password hashing fully implemented
- **API Type Safety**: All routes properly typed with RequestHandler
- **Database Types**: Drizzle ORM schema with correct field types
- **Development Server**: Running without 500 errors or warnings
- **Ready for**: Content management feature implementation

## 🚧 **Next Development Priorities**

### 1. Content Management (Immediate Priority)
- **Posts Management Page** - CRUD interface for blog posts
- **Pages Management** - Static page creation and editing
- **Media Management** - File upload and organization system
- **Markdown Editor** - Content editing with preview capabilities

### 2. Static Site Generation
- **SvelteKit Adapter-Static** configuration
- **Post Rendering** - Markdown to HTML conversion
- **SEO Implementation** - Meta tags, sitemap.xml
- **Public Theme** - Blog frontend with responsive design

### 3. API & Backend
- **REST API Endpoints** - CRUD operations for all content types
- **File Upload System** - Media handling with Cloudflare integration
- **Content Validation** - Input sanitization and schema validation

### 4. Authentication Enhancements
- **Oslo Password Reset System** - Implement secure password reset using Oslo cryptographic primitives
  - Create `password_reset_tokens` database table
  - Use Oslo's `@oslojs/crypto` for token generation and hashing
  - Integrate with existing email service infrastructure
  - Replace temporary "coming soon" UI with full functionality

### 5. Production Deployment
- **Cloudflare Pages** setup and configuration
- **D1 Database Migration** from SQLite
- **Environment Configuration** and secrets management

## Development Guidelines

### Framework Patterns

#### Svelte 5 Runes Usage
```javascript
// State management
let data = $state([]);
let loading = $state(false);

// Derived values
let filteredData = $derived(data.filter(item => item.active));

// Side effects
$effect(() => {
  if (typeof window !== 'undefined') {
    // Browser-only code
  }
});
```

#### DaisyUI Component Styling
- **Priority 1**: Use built-in DaisyUI variants (`badge-soft`, `alert-soft`)
- **Priority 2**: Apply Tailwind utility classes
- **Priority 3**: Use `@apply` directive in CSS
- **Priority 4**: Use `[data-theme]` selectors for theme-specific styling

#### Localization Pattern
```javascript
// Modern flat message structure
import * as m from '$lib/paraglide/messages';

// Usage in components
{m.dashboard_title()}
{m.user_menu_profile()}
{m.auth_login_button()}
```

### Database Schema Reference

#### Core Tables
- **users** - User accounts with roles and preferences
- **sessions** - Authentication sessions with expiration
- **posts** - Blog posts with content and metadata
- **pages** - Static pages with custom content
- **media** - File uploads with metadata and relationships
- **categories** - Hierarchical content organization
- **tags** - Content tagging system
- **settings** - Application configuration

#### Key Relationships
- Users → Posts (author relationship)
- Posts → Categories (many-to-many via post_categories)
- Posts → Tags (many-to-many via post_tags)
- Posts → Media (featured image relationship)

### API Endpoints Structure

#### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `POST /api/auth/signup` - User registration
- `POST /api/auth/reset-password` - Password reset

#### Content Management (To Be Implemented)
- `GET/POST/PUT/DELETE /api/posts` - Posts CRUD
- `GET/POST/PUT/DELETE /api/pages` - Pages CRUD
- `GET/POST/PUT/DELETE /api/media` - Media CRUD
- `GET/POST/PUT/DELETE /api/users` - User management

### Development Workflow

#### Local Development
1. **Database**: SQLite (`local.db`)
2. **Email**: Console provider for password reset testing
3. **Build**: `pnpm dev` for development server
4. **Testing**: Manual testing via admin interface

#### Production Deployment
1. **Database**: Cloudflare D1
2. **Email**: Production email provider (Resend, AWS SES)
3. **Build**: `pnpm build` with adapter-static
4. **Deploy**: Cloudflare Pages

### Code Quality Standards

#### TypeScript
- Strict mode enabled
- Full type coverage for database operations
- Interface definitions for all API responses
- Type-safe component props

#### CSS/Styling
- TailwindCSS 4 CSS-first configuration
- DaisyUI components with minimal custom CSS
- Responsive design patterns
- Light/dark theme support

#### Testing
- Manual testing procedures documented
- Auth flow validation required
- Cross-browser compatibility checks
- Mobile responsiveness verification

## File Structure Reference

```
├── src/
│   ├── app.css                    # TailwindCSS + DaisyUI configuration
│   ├── app.html                   # Base HTML template
│   ├── hooks.server.ts            # Authentication middleware
│   ├── lib/
│   │   ├── components/            # Reusable UI components
│   │   ├── paraglide/             # i18n generated files
│   │   ├── server/
│   │   │   ├── auth.ts            # Oslo + Arctic auth utilities
│   │   │   └── db/                # Database configuration and schema
│   │   └── stores/                # Svelte stores for client state
│   └── routes/
│       ├── admin/                 # Protected admin interface
│       │   ├── +layout.svelte     # Admin layout with sidebar
│       │   ├── +page.svelte       # Dashboard
│       │   ├── login/             # Authentication pages
│       │   └── ...                # Other admin pages
│       └── api/                   # Server-side API endpoints
├── messages/                      # i18n source files
├── drizzle/                       # Database migrations
└── Documentation/                 # Project documentation
```

## Environment Variables

### Required for Development
```env
DATABASE_URL=file:local.db
SESSION_SECRET=your-session-secret
EMAIL_PROVIDER=console
```

### Required for Production
```env
DATABASE_URL=your-d1-connection-string
SESSION_SECRET=your-production-secret
EMAIL_PROVIDER=resend
EMAIL_API_KEY=your-email-provider-key
EMAIL_FROM=noreply@yourdomain.com
```

## Common Development Tasks

### Create Admin User
```bash
pnpm run db:seed-standalone
```

### Run Database Migrations
```bash
pnpm run db:migrate
```

### Test Authentication Flow
1. Navigate to `/admin/login`
2. Use seeded admin credentials
3. Verify dashboard access
4. Test theme switching and language switching
5. Verify logout functionality

### Add New Content Type
1. Update database schema in `src/lib/server/db/schema.ts`
2. Generate migration with `pnpm run db:generate`
3. Create API endpoints in `src/routes/api/`
4. Build admin interface components
5. Add localization messages

## Performance Considerations

### Framework Optimizations
- Svelte 5 fine-grained reactivity reduces re-renders
- TailwindCSS 4 Oxide engine improves build performance
- SvelteKit static generation for optimal loading
- Drizzle ORM with prepared statements

### Recommended Practices
- Use `$derived` for computed values instead of reactive statements
- Prefer DaisyUI built-in variants over custom CSS
- Implement proper loading states with `$state`
- Use Paraglide's universal i18n for consistent translations

---

**Last Updated**: 2025-07-23  
**Framework Stack**: All frameworks updated to 2025 best practices  
**Development Status**: Phase 1 Complete - Zero TypeScript Errors, Ready for Content Management  
**TypeScript Status**: ✅ 0 compilation errors (45+ errors systematically resolved)