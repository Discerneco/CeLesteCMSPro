# Sites Management System

## Overview

CeLesteCMS Pro features a revolutionary multi-site management system that allows users to manage multiple websites from a single admin interface. Each site operates independently with its own content, templates, and configuration while sharing the same admin framework.

## Architecture

### Multi-Site Database Design
- **Sites Table**: Core site configuration (id, name, slug, settings)
- **Content Isolation**: Each site's content is logically separated
- **Shared Resources**: Users, media, and templates can be shared across sites
- **Independent Configuration**: Each site has its own settings and template assignments

### Site Slug System
- **Unique Identifiers**: Each site has a unique slug for URL routing
- **Preview URLs**: Sites accessible at `/preview/{site-slug}/`
- **Build Management**: Individual build directories per site
- **Performance**: Static file serving with proper caching per site

## Admin Interface

### Sites Management (`/admin/sites`)
- **Site Listing**: Overview of all managed sites
- **Quick Actions**: Create, edit, delete, and preview sites
- **Status Indicators**: Build status, last updated, preview availability
- **Bulk Operations**: Manage multiple sites efficiently

### Site Configuration
- **Basic Settings**: Site name, description, domain configuration
- **Template Assignment**: Link sites to specific Horizonte templates
- **Build Settings**: Generation preferences and deployment options
- **Performance Settings**: Caching rules and optimization preferences

## Status Indicator System

### Three-Dot Status Overview
Each site displays three colored status dots providing at-a-glance health monitoring.
The dots behave differently for **Static** vs **Dynamic** generation modes.

#### Dot 1: Publication/Deployment Status 🌐

**For STATIC Sites:**
- 🟢 **Green**: Deployed to external domain (built and published)
- 🟣 **Purple**: Built locally (localhost development, successful build)
- 🔵 **Blue**: Currently building/generating
- 🔘 **Gray**: Not built yet

**For DYNAMIC Sites:**
- 🟢 **Green**: Live with domain (API active)
- 🟣 **Purple**: Running locally (development server at localhost:5173)
- 🔘 **Gray**: Inactive/disabled

#### Dot 2: Error Status ❌
**Purpose**: System health and error monitoring (same for both modes)
- 🟢 **Green**: All systems operational (database OK, build OK, server UP for localhost)
- 🟡 **Yellow**: Performance warnings (slow database response >1000ms)
- 🔴 **Red**: Critical errors (server down, build failed, database errors)
- 🔘 **Gray**: Unable to determine status

**Monitored Systems**:
- Database connectivity and response time
- Build/generation status
- Server availability (localhost sites only via `http://localhost:5173/sites/{slug}`)
- Network and hardware issues

#### Dot 3: Content Status 📄

**For STATIC Sites:**
- 🟢 **Green**: Content synced with last build
- 🟡 **Yellow**: Minor changes pending (media, settings)
- 🔴 **Red**: Major changes need rebuild (posts, pages)
- 🔘 **Gray**: Never built or unknown

**For DYNAMIC Sites:**
- 🟢 **Green**: Data layer healthy (API/cache working)
- 🟡 **Yellow**: Cache stale or minor issues
- 🔴 **Red**: Data layer errors
- 🔘 **Gray**: Unknown status

### Visual Indicators
- **Computer Icon** 💻: Localhost development sites (no external domain)
- **Globe Icon** 🌐: Externally deployed sites (has domain)
- **URL Display**: Shows "localhost:5173" for local sites, domain or slug for others
- **Generation Mode Badge**: "Static" or "Dynamic" indicator on each site card

### Implementation Details

#### Server Status Checking (Localhost)
For localhost development sites, the system performs health checks:
- Pings `http://localhost:5173/sites/{slug}` with 2-second timeout
- Updates Dot 2 (Error Status) based on server availability
- Only applies to sites without external domains

#### Status Priority
The error status (Dot 2) follows this priority:
1. 🔴 **Red**: Any critical failure (server down, build error, database failure)
2. 🟡 **Yellow**: Performance issues but operational
3. 🟢 **Green**: All systems functioning normally

## Site Generation Process

### Build System
1. **Content Compilation**: Gather site-specific posts, pages, and media
2. **Template Processing**: Apply assigned Horizonte template
3. **Static Generation**: SvelteKit-based build process
4. **Asset Optimization**: Image processing and code splitting
5. **Deployment**: Static files ready for hosting

### Preview System
- **Instant Preview**: Live preview during development
- **Static File Serving**: Production-like performance
- **HTTP Caching**: Proper cache headers for optimal loading
- **URL Rewriting**: Proper link processing for preview context

## API Endpoints

### Sites API (`/api/sites`)
```typescript
GET    /api/sites           // List all sites
POST   /api/sites           // Create new site
GET    /api/sites/[id]      // Get site details
PUT    /api/sites/[id]      // Update site
DELETE /api/sites/[id]      // Delete site
POST   /api/sites/[id]/build // Trigger site build
```

### Site-Specific Content
- **Content Scoping**: API endpoints automatically filter by site context
- **Cross-Site References**: Controlled sharing of resources when needed
- **Bulk Operations**: Efficient content management across sites

## Performance Optimization

### Static File Serving
- **Industry Standard**: Following Ghost, Jekyll, Astro patterns
- **HTTP Caching**: 5-minute HTML, 1-day asset caching
- **ETag Support**: Conditional requests with 304 responses
- **Response Times**: Optimized to 13-28ms average response time

### Build Optimization
- **Incremental Builds**: Only rebuild changed content
- **Asset Deduplication**: Shared assets across sites
- **Code Splitting**: Optimal bundle sizes per site
- **CDN Ready**: Static files optimized for global distribution

## Use Cases

### Agency Management
- **Client Sites**: Manage multiple client websites from single dashboard
- **Template Reuse**: Apply consistent branding across client sites  
- **Content Isolation**: Secure separation between different clients
- **Billing Integration**: Per-site usage tracking and billing

### Multi-Brand Companies
- **Brand Management**: Different websites for different product lines
- **Shared Resources**: Common assets and user management
- **Consistent Infrastructure**: Single deployment pipeline for all brands
- **Performance Monitoring**: Centralized analytics across all sites

### Development Workflows
- **Staging Sites**: Test changes before production deployment
- **Version Management**: Multiple versions of same site for A/B testing
- **Client Collaboration**: Shared preview URLs for client feedback
- **Deployment Automation**: Automated builds and deployments

## Security Considerations

### Site Isolation
- **Content Security**: Logical separation prevents cross-site data leakage
- **Access Control**: User permissions can be scoped per site
- **Build Security**: Isolated build environments prevent cross-contamination
- **Preview Security**: Secure preview URLs with proper access controls

### Performance Security
- **DDoS Protection**: Static file serving reduces attack surface
- **Cache Security**: Proper cache headers prevent information leakage
- **Asset Security**: Secure handling of media and static assets
- **Build Security**: Controlled build processes prevent malicious code injection

## Future Enhancements

### Advanced Multi-Site Features
- **Site Templates**: Pre-built site configurations for rapid deployment
- **Cross-Site Analytics**: Unified analytics dashboard across all sites
- **Automated Backups**: Per-site backup and restore capabilities
- **Custom Domains**: Full domain management and SSL certificates

### Enterprise Features
- **Team Management**: Role-based access control per site
- **White Labeling**: Custom branding for agency deployments
- **API Extensions**: Site-specific API customizations
- **Advanced Monitoring**: Performance monitoring and alerting per site

---

**Status**: Production-ready multi-site architecture  
**Performance**: Optimized static file serving with proper caching  
**Next Phase**: Plugin system integration and WordPress migration tool