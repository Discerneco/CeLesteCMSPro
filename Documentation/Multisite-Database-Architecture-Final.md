# CeLesteCMS Pro: Final Multisite Database Architecture

## **Executive Summary**

CeLesteCMS Pro will implement a **database-per-site architecture** with complete isolation between tenants. Since we're in alpha with no existing clients, we can build the correct architecture from the start without migration concerns.

**Architecture**: 1 Admin Database + N Site Databases

---

## **Core Architecture Design**

### **Database Structure**
```
databases/
├── admin.db         # Control plane - admin users & site registry
└── sites/           # Content plane - isolated site databases
    ├── restaurant.db
    ├── lawfirm.db
    └── agency.db
```

### **Key Principles**
1. **Complete Isolation**: Each site has its own database and file storage
2. **No Shared Content**: No cross-site data queries possible
3. **Simple Mental Model**: Admin controls access, Sites contain content
4. **Security by Design**: Database isolation prevents data leaks

---

## **Database Schemas**

### **Admin Database (`admin.db`)**

**Purpose**: Authentication, authorization, and orchestration

```sql
-- Admin users who can manage multiple sites
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('super_admin', 'agency_owner', 'developer')),
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registry of all sites in the system
CREATE TABLE sites_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  database_path TEXT NOT NULL,      -- 'sites/restaurant.db'
  storage_path TEXT NOT NULL,       -- 'storage/sites/restaurant/'
  domain TEXT,
  owner_id TEXT REFERENCES admin_users(id),
  status TEXT CHECK(status IN ('active', 'suspended', 'archived')),
  plan_type TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP
);

-- Which admins can access which sites
CREATE TABLE site_permissions (
  admin_user_id TEXT REFERENCES admin_users(id),
  site_id TEXT REFERENCES sites_registry(id),
  role TEXT CHECK(role IN ('owner', 'admin', 'manager')),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by TEXT REFERENCES admin_users(id),
  PRIMARY KEY (admin_user_id, site_id)
);

-- Admin authentication sessions
CREATE TABLE admin_sessions (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT REFERENCES admin_users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  current_site_id TEXT,              -- Currently managing site
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing and subscriptions
CREATE TABLE billing (
  id TEXT PRIMARY KEY,
  site_id TEXT REFERENCES sites_registry(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT,
  status TEXT,
  next_billing_date TIMESTAMP
);

-- Global settings for the platform
CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Site Database (`sites/[slug].db`)**

**Purpose**: Isolated content storage for each site

```sql
-- Site-specific users (optional - sites may not have users)
CREATE TABLE site_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT CHECK(role IN ('admin', 'editor', 'author', 'subscriber')),
  first_name TEXT,
  last_name TEXT,
  admin_user_id TEXT,                -- Links to admin.db if admin-created
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Blog posts
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author_id TEXT REFERENCES site_users(id),
  featured_image_id TEXT REFERENCES media(id),
  status TEXT CHECK(status IN ('draft', 'published', 'archived', 'trash')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  meta_data TEXT JSON                -- SEO, custom fields, etc.
);

-- Static pages
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author_id TEXT REFERENCES site_users(id),
  featured_image_id TEXT REFERENCES media(id),
  template_id TEXT,
  status TEXT CHECK(status IN ('draft', 'published', 'archived', 'trash')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  meta_data TEXT JSON
);

-- Media library references
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  path TEXT NOT NULL,                 -- 'uploads/2024/01/image.jpg'
  url TEXT NOT NULL,                  -- Full URL for serving
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  uploader_id TEXT REFERENCES site_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT JSON
);

-- Categories for posts
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id TEXT REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags for posts
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationships
CREATE TABLE post_categories (
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE post_tags (
  post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
  tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Site-specific settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site metadata and versioning
CREATE TABLE _metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial metadata
INSERT INTO _metadata (key, value) VALUES
  ('schema_version', '1'),
  ('created_at', CURRENT_TIMESTAMP);
```

---

## **File Storage Architecture**

### **Directory Structure**
```
storage/
├── global/                  # Platform-wide assets (managed by admin)
│   ├── templates/          # Template assets
│   ├── stock/              # Stock images (if needed)
│   └── platform/           # Platform branding
│
└── sites/                  # Isolated per-site storage
    ├── restaurant/
    │   ├── uploads/        # User uploads
    │   │   ├── 2024/
    │   │   │   ├── 01/
    │   │   │   └── 02/
    │   ├── generated/      # Thumbnails, optimized images
    │   └── temp/           # Temporary processing files
    │
    └── lawfirm/
        ├── uploads/
        ├── generated/
        └── temp/
```

### **Storage Isolation Benefits**
- **Security**: Files physically separated by site
- **Compliance**: Easy GDPR deletion (remove entire folder)
- **Quotas**: Simple per-site storage limits
- **Performance**: No cross-site file scanning
- **Backups**: Site-specific backup strategies

---

## **Implementation Code Structure**

### **Database Connection Manager**
```typescript
// src/lib/server/db/multisite-manager.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

export class MultisiteManager {
  private adminDb: ReturnType<typeof drizzle>;
  private siteConnections = new Map<string, ReturnType<typeof drizzle>>();

  constructor() {
    const adminDatabase = new Database('databases/admin.db');
    this.adminDb = drizzle(adminDatabase);
  }

  async getAdminDb() {
    return this.adminDb;
  }

  async getSiteDb(siteSlug: string) {
    // Return cached connection if exists
    if (this.siteConnections.has(siteSlug)) {
      return this.siteConnections.get(siteSlug)!;
    }

    // Verify site exists in registry
    const site = await this.adminDb
      .select()
      .from(sitesRegistry)
      .where(eq(sitesRegistry.slug, siteSlug))
      .limit(1);

    if (!site[0]) {
      throw new Error(`Site not found: ${siteSlug}`);
    }

    // Create new connection
    const siteDatabase = new Database(`databases/${site[0].databasePath}`);
    const siteDb = drizzle(siteDatabase);

    // Cache for future use
    this.siteConnections.set(siteSlug, siteDb);

    // Update last accessed
    await this.adminDb
      .update(sitesRegistry)
      .set({ lastAccessedAt: new Date() })
      .where(eq(sitesRegistry.id, site[0].id));

    return siteDb;
  }

  async closeSiteDb(siteSlug: string) {
    const db = this.siteConnections.get(siteSlug);
    if (db) {
      // Close the SQLite connection
      this.siteConnections.delete(siteSlug);
    }
  }
}

export const multisiteManager = new MultisiteManager();
```

### **Site Creation Service**
```typescript
// src/lib/server/services/site-creator.ts
import { SITE_SCHEMA } from '../db/site-schema';
import { multisiteManager } from '../db/multisite-manager';
import { createId } from '@paralleldrive/cuid2';
import Database from 'better-sqlite3';
import { mkdir } from 'fs/promises';

export async function createNewSite(
  adminUserId: string,
  siteConfig: {
    name: string;
    slug: string;
    domain?: string;
  }
) {
  const adminDb = await multisiteManager.getAdminDb();

  // 1. Create site record in registry
  const [site] = await adminDb
    .insert(sitesRegistry)
    .values({
      id: createId(),
      name: siteConfig.name,
      slug: siteConfig.slug,
      domain: siteConfig.domain,
      databasePath: `sites/${siteConfig.slug}.db`,
      storagePath: `storage/sites/${siteConfig.slug}`,
      ownerId: adminUserId,
      status: 'active',
      createdAt: new Date()
    })
    .returning();

  // 2. Create site database
  const dbPath = `databases/sites/${siteConfig.slug}.db`;
  const siteDatabase = new Database(dbPath);

  // 3. Initialize schema
  siteDatabase.exec(SITE_SCHEMA);

  // 4. Set initial settings
  siteDatabase.prepare(`
    INSERT INTO settings (key, value) VALUES
    ('site_name', json(?)),
    ('site_description', json(?)),
    ('site_created', json(?))
  `).run(
    JSON.stringify(siteConfig.name),
    JSON.stringify(''),
    JSON.stringify(new Date().toISOString())
  );

  // 5. Create storage directories
  await mkdir(`storage/sites/${siteConfig.slug}/uploads`, { recursive: true });
  await mkdir(`storage/sites/${siteConfig.slug}/generated`, { recursive: true });
  await mkdir(`storage/sites/${siteConfig.slug}/temp`, { recursive: true });

  // 6. Grant owner permissions
  await adminDb
    .insert(sitePermissions)
    .values({
      adminUserId,
      siteId: site.id,
      role: 'owner',
      grantedAt: new Date(),
      grantedBy: adminUserId
    });

  siteDatabase.close();

  return site;
}
```

### **Authentication Middleware**
```typescript
// src/lib/server/auth/multisite-auth.ts
export class MultisiteAuth {
  // Admin authentication (cross-site)
  async authenticateAdmin(event: RequestEvent): Promise<AdminUser | null> {
    const adminDb = await multisiteManager.getAdminDb();
    const sessionToken = event.cookies.get('admin_session');

    if (!sessionToken) return null;

    const session = await adminDb
      .select()
      .from(adminSessions)
      .where(and(
        eq(adminSessions.token, sessionToken),
        gt(adminSessions.expiresAt, new Date())
      ))
      .limit(1);

    return session[0]?.adminUser || null;
  }

  // Site user authentication (site-specific)
  async authenticateSiteUser(
    siteSlug: string,
    event: RequestEvent
  ): Promise<SiteUser | null> {
    const siteDb = await multisiteManager.getSiteDb(siteSlug);
    const sessionToken = event.cookies.get(`site_${siteSlug}_session`);

    if (!sessionToken) return null;

    const session = await siteDb
      .select()
      .from(siteSessions)
      .where(and(
        eq(siteSessions.token, sessionToken),
        gt(siteSessions.expiresAt, new Date())
      ))
      .limit(1);

    return session[0]?.siteUser || null;
  }

  // Check admin's permission for a specific site
  async checkAdminSiteAccess(
    adminUserId: string,
    siteId: string
  ): Promise<boolean> {
    const adminDb = await multisiteManager.getAdminDb();

    const permission = await adminDb
      .select()
      .from(sitePermissions)
      .where(and(
        eq(sitePermissions.adminUserId, adminUserId),
        eq(sitePermissions.siteId, siteId)
      ))
      .limit(1);

    return permission.length > 0;
  }
}
```

---

## **API Route Structure**

### **Admin API Routes**
```
/admin/api/
├── auth/
│   ├── login          # Admin login
│   └── logout         # Admin logout
├── sites/
│   ├── GET           # List sites admin can access
│   ├── POST          # Create new site
│   └── [siteId]/
│       ├── GET       # Get site details
│       ├── PUT       # Update site settings
│       ├── DELETE    # Delete site
│       └── switch    # Switch active site context
└── users/
    ├── GET           # List admin users
    └── POST          # Create admin user
```

### **Site-Specific API Routes**
```
/api/sites/[slug]/
├── auth/
│   ├── login         # Site user login
│   └── logout        # Site user logout
├── posts/
│   ├── GET          # List posts (public)
│   └── [id]/
│       └── GET      # Get single post
└── admin/           # Site admin APIs (protected)
    ├── posts/
    ├── pages/
    ├── media/
    └── settings/
```

---

## **Migration Strategy (From Current System)**

Since we're in **alpha with no real clients**, we can implement this architecture immediately:

### **Phase 1: Core Implementation (Week 1)**
1. Create admin database schema
2. Implement MultisiteManager class
3. Build site creation service
4. Update authentication system

### **Phase 2: API Refactoring (Week 2)**
1. Update all API routes for site context
2. Implement permission checking
3. Create site switching mechanism
4. Update admin UI for site selection

### **Phase 3: Testing & Polish (Week 3)**
1. Create demo sites for testing
2. Test isolation between sites
3. Performance benchmarking
4. Documentation updates

---

## **Benefits of This Architecture**

### **Security & Isolation**
- **Perfect Isolation**: No possibility of data leakage between sites
- **Clear Boundaries**: Database files physically separated
- **Simple Security Model**: Can't query what you can't connect to

### **Performance**
- **Scalable**: Each site database remains small and fast
- **Independent**: One site's load doesn't affect others
- **Cacheable**: Can cache connections per site

### **Business Model**
- **SaaS Ready**: Clear tenant boundaries for billing
- **Storage Quotas**: Easy to implement per-site limits
- **White Label**: Complete isolation for enterprise clients

### **Operations**
- **Simple Backups**: Backup individual site databases
- **Easy Migration**: Move site to different server
- **Clear Deletion**: Delete database file + storage folder

### **Development**
- **Clean Architecture**: Clear separation of concerns
- **Easier Debugging**: Know exactly which database you're in
- **Simple Mental Model**: Admin controls, Sites contain

---

## **Comparison with Alternatives**

| Aspect | Database-per-Site | Site ID Columns | Shared Tables |
|--------|------------------|-----------------|---------------|
| **Data Isolation** | ⭐⭐⭐⭐⭐ Perfect | ⭐⭐⭐ Query-based | ⭐⭐ Minimal |
| **Security** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good | ⭐⭐ Risk prone |
| **Performance** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good | ⭐⭐⭐ Good |
| **Complexity** | ⭐⭐⭐ Medium | ⭐⭐ Low | ⭐ Very Low |
| **Scalability** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good | ⭐⭐ Limited |
| **GDPR Compliance** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Complex | ⭐⭐ Complex |
| **Backup Strategy** | ⭐⭐⭐⭐⭐ Simple | ⭐⭐⭐ Complex | ⭐⭐⭐ Complex |

---

## **Decision Rationale**

### **Why Database-per-Site?**
1. **Alpha Freedom**: No existing data to migrate
2. **Competitive Edge**: "True isolation" is a major selling point
3. **Enterprise Ready**: Architecture that scales to large clients
4. **Security First**: Impossible to leak data between sites
5. **Clear Value Prop**: Easy to explain to potential customers

### **Why Not Site ID Columns?**
1. **Technical Debt**: Would need migration later anyway
2. **Security Risk**: One forgotten WHERE clause = data breach
3. **Less Impressive**: Harder to sell as "enterprise-grade"
4. **Performance**: Shared tables grow large over time

### **Why Not Wait?**
1. **Alpha Advantage**: Can build right architecture now
2. **No Migration**: Avoid future 2-month migration project
3. **Clean Start**: No legacy decisions to work around

---

## **Implementation Priority**

### **Immediate (Before Any Other Features)**
1. Fix Portuguese excerpt auto-save bug (1 hour)
2. Implement admin database (1 day)
3. Create MultisiteManager (1 day)
4. Build site creation flow (1 day)
5. Update authentication (2 days)
6. Refactor APIs for site context (3 days)

**Total: ~7-8 working days**

---

## **Conclusion**

The database-per-site architecture provides CeLesteCMS Pro with:
- **Enterprise-grade isolation** without enterprise complexity
- **Clear competitive advantage** over shared-table CMSs
- **Future-proof architecture** that scales from 1 to 1000+ sites
- **Security by design** rather than security by query filters

Since we're in alpha with no technical debt or existing clients, implementing this architecture now is the optimal decision for long-term success.

---

**Status**: Architecture Decision Complete
**Next Step**: Begin implementation with admin database schema
**Timeline**: 7-8 days for core implementation
**Priority**: CRITICAL - Foundational architecture