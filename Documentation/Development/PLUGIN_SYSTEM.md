# CeLesteCMS Pro Plugin System Architecture

## Overview

CeLesteCMS Pro features a comprehensive plugin ecosystem designed for security, extensibility, and seamless integration with the Horizonte template system. The plugin architecture enables hot-loading, crash protection, and progressive security models while maintaining the core system's stability.

## Philosophy

### Core Principles
- **Security First**: Three-tier security model with signed packages and permission systems
- **Crash Protection**: Plugins cannot crash the core CeLeste system
- **Hot Loading**: Plugins can be loaded/unloaded without system restart
- **Horizonte Integration**: Plugins extend template sections seamlessly
- **Database Isolation**: Each plugin manages its own database schema
- **Progressive Enhancement**: Simple → Pro → SaaS feature progression

## Plugin Security Architecture

### Three-Tier Security Model

#### **Tier 1: Official Plugins** 🟢
```yaml
Security Level: Highest
Source: CeLeste Team
Signature: Signed by CeLeste private key
Review Process: Full code review and security audit
Installation: No warnings, automatic approval
API Access: Full system access
Examples: Comments Plugin, SEO Plugin, Analytics Plugin
```

#### **Tier 2: Verified Developers** 🟡  
```yaml
Security Level: Medium
Source: Verified third-party developers
Signature: Developer-signed with CeLeste verification
Review Process: Basic automated scanning + developer verification
Installation: Permission warnings shown to users
API Access: Limited by permission system
Examples: E-commerce plugins, Custom integrations
```

#### **Tier 3: Community Plugins** 🔴
```yaml
Security Level: User Beware
Source: Unverified community
Signature: Self-signed or unsigned
Review Process: None (user responsibility)
Installation: Clear security warnings required
API Access: Minimal permissions by default
Examples: Experimental plugins, Personal customizations
```

## Plugin Package Format

### Package Structure
```
my-plugin.celeste (signed ZIP file)
├── plugin.json              # Plugin metadata and configuration
├── signature.txt             # Cryptographic signature
├── src/
│   ├── index.js              # Main plugin entry point
│   ├── components/           # Svelte components
│   │   ├── CommentForm.svelte
│   │   └── CommentList.svelte
│   ├── sections/             # Horizonte template sections
│   │   └── CommentsSection.svelte
│   ├── api/                  # API endpoint handlers
│   │   └── comments.js
│   ├── admin/               # Admin interface components
│   │   └── CommentsAdmin.svelte
│   └── migrations/          # Database migrations
│       └── 001_create_comments.sql
├── assets/                  # Static assets
│   ├── styles.css
│   └── icons/
└── README.md               # Plugin documentation
```

### plugin.json Schema
```json
{
  "name": "comments-plugin",
  "version": "1.2.0",
  "description": "Native commenting system with moderation",
  "author": "CeLeste Team",
  "license": "MIT",
  "homepage": "https://github.com/celestecms/comments-plugin",
  "repository": "https://github.com/celestecms/comments-plugin",
  
  "celeste": {
    "minVersion": "1.0.0",
    "maxVersion": "2.0.0",
    "type": "free|pro|premium",
    "tier": "official|verified|community",
    
    "permissions": [
      "database.create",
      "database.read", 
      "database.write",
      "api.create",
      "admin.create",
      "hooks.register"
    ],
    
    "sections": [
      {
        "name": "comments",
        "component": "CommentsSection",
        "variants": ["threaded", "flat", "minimal"],
        "description": "Display and manage comments for content"
      }
    ],
    
    "adminRoutes": [
      {
        "path": "/admin/comments",
        "component": "CommentsAdmin",
        "title": "Comments",
        "icon": "message-square"
      }
    ],
    
    "apiRoutes": [
      "/api/comments",
      "/api/comments/:id"
    ],
    
    "hooks": [
      "post.created",
      "post.updated", 
      "user.login"
    ],
    
    "dependencies": [],
    
    "database": {
      "tables": ["comments", "comment_meta"],
      "migrations": "migrations/"
    }
  },
  
  "signature": "sha256-abc123...",
  "checksum": "sha256-def456..."
}
```

## Plugin Components Architecture

### 1. Horizonte Template Integration
```svelte
<!-- CommentsSection.svelte -->
<script>
  let { variant = 'threaded', postId, moderation = false } = $props();
  
  // Plugin section component integrates seamlessly with Horizonte
  import { getComments, postComment } from '../api/comments.js';
  
  let comments = $state([]);
  let loading = $state(true);
  
  $effect(async () => {
    comments = await getComments(postId);
    loading = false;
  });
</script>

{#if loading}
  <div class="loading loading-spinner"></div>
{:else}
  <!-- Comment display based on variant -->
  {#if variant === 'threaded'}
    <ThreadedComments {comments} {postId} />
  {:else if variant === 'flat'}  
    <FlatComments {comments} {postId} />
  {:else if variant === 'minimal'}
    <MinimalComments {comments} {postId} />
  {/if}
{/if}
```

### 2. Template Usage
```horizonte
[menu:main]
[header:breadcrumb]
[content:article]
[comments:threaded,moderation=true]  ← Plugin-powered section
[related-posts:grid,limit=3]
[footer:minimal]
```

### 3. Admin Interface Integration
```svelte
<!-- CommentsAdmin.svelte -->
<script>
  // Plugin provides its own admin interface
  import { getComments, moderateComment } from '../api/comments.js';
  
  let comments = $state([]);
  let filter = $state('pending');
</script>

<div class="cms-page-header">
  <h1>Comments Management</h1>
  <div class="stats">
    <div class="stat">
      <div class="stat-title">Pending</div>
      <div class="stat-value">{pendingCount}</div>
    </div>
  </div>
</div>

<!-- Comment moderation interface -->
<div class="cms-grid-content">
  <!-- Comment list with approve/reject actions -->
</div>
```

## Database Architecture

### Plugin Database Isolation
```sql
-- Each plugin creates its own tables
-- Comments Plugin Example:

CREATE TABLE plugin_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, spam
  parent_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key to core posts table
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE plugin_comment_meta (
  id TEXT PRIMARY KEY,
  comment_id TEXT NOT NULL,
  meta_key TEXT NOT NULL,
  meta_value TEXT,
  
  FOREIGN KEY (comment_id) REFERENCES plugin_comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_post_id ON plugin_comments(post_id);
CREATE INDEX idx_comments_status ON plugin_comments(status);
CREATE INDEX idx_comment_meta_key ON plugin_comment_meta(meta_key);
```

### Plugin Database Management
```javascript
// Plugin database handler
class PluginDatabase {
  constructor(pluginId) {
    this.prefix = `plugin_${pluginId}_`;
    this.db = getPluginDB(pluginId);
  }
  
  async createTable(tableName, schema) {
    // Automatically prefixes table names
    const fullTableName = this.prefix + tableName;
    await this.db.execute(schema.replace(tableName, fullTableName));
  }
  
  async runMigrations(migrationsPath) {
    // Run plugin-specific migrations
    const migrations = await loadMigrations(migrationsPath);
    for (const migration of migrations) {
      await this.db.execute(migration);
    }
  }
}
```

## Plugin Loading & Management

### Plugin Manager Architecture
```javascript
// src/lib/server/plugins/PluginManager.js
export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.sections = new Map();
    this.adminRoutes = new Map();
    this.apiRoutes = new Map();
    this.securityLevel = 'medium'; // configurable
  }
  
  async loadPlugin(pluginPath) {
    try {
      // 1. Verify plugin signature
      const isValid = await this.verifyPluginSecurity(pluginPath);
      if (!isValid && this.securityLevel === 'high') {
        throw new Error('Plugin signature verification failed');
      }
      
      // 2. Load plugin configuration
      const config = await this.loadPluginConfig(pluginPath);
      
      // 3. Check permissions
      await this.validatePluginPermissions(config);
      
      // 4. Create isolated environment
      const pluginInstance = await this.createPluginSandbox(config);
      
      // 5. Initialize plugin
      await pluginInstance.initialize();
      
      // 6. Register plugin components
      this.registerPluginComponents(config, pluginInstance);
      
      // 7. Store plugin reference
      this.plugins.set(config.name, pluginInstance);
      
      return { success: true, plugin: pluginInstance };
      
    } catch (error) {
      console.error(`Failed to load plugin: ${error.message}`);
      // Plugin failure doesn't crash core system
      return { success: false, error: error.message };
    }
  }
  
  async unloadPlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      // Cleanup plugin resources
      await plugin.cleanup();
      
      // Remove from registries
      this.removePluginComponents(pluginName);
      this.plugins.delete(pluginName);
      
      return true;
    }
    return false;
  }
  
  async reloadPlugin(pluginName) {
    await this.unloadPlugin(pluginName);
    // Reload from disk
    const pluginPath = this.getPluginPath(pluginName);
    return await this.loadPlugin(pluginPath);
  }
  
  registerPluginComponents(config, pluginInstance) {
    // Register Horizonte sections
    for (const section of config.celeste.sections) {
      this.sections.set(section.name, {
        component: pluginInstance.getSection(section.name),
        variants: section.variants,
        plugin: config.name
      });
    }
    
    // Register admin routes
    for (const route of config.celeste.adminRoutes) {
      this.adminRoutes.set(route.path, {
        component: pluginInstance.getAdminComponent(route.component),
        title: route.title,
        icon: route.icon,
        plugin: config.name
      });
    }
    
    // Register API routes
    for (const route of config.celeste.apiRoutes) {
      this.apiRoutes.set(route, {
        handler: pluginInstance.getAPIHandler(route),
        plugin: config.name
      });
    }
  }
  
  getSection(sectionName) {
    return this.sections.get(sectionName);
  }
  
  hasSection(sectionName) {
    return this.sections.has(sectionName);
  }
}
```

### Plugin Security Verification
```javascript
// Plugin security verification
export class PluginSecurity {
  async verifyPluginSignature(pluginPath) {
    try {
      const pluginData = await fs.readFile(pluginPath);
      const { signature, content } = this.extractSignature(pluginData);
      
      // Verify against known public keys
      const publicKey = await this.getPublicKey(signature.issuer);
      const isValid = await crypto.verify(signature, content, publicKey);
      
      return {
        valid: isValid,
        tier: this.getSecurityTier(signature.issuer),
        permissions: signature.permissions || []
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  async checkPluginPermissions(requestedPermissions) {
    // Validate each requested permission
    const allowedPermissions = [
      'database.read',
      'database.write', 
      'database.create',
      'api.create',
      'admin.create',
      'hooks.register',
      'files.upload',
      'email.send'
    ];
    
    for (const permission of requestedPermissions) {
      if (!allowedPermissions.includes(permission)) {
        throw new Error(`Invalid permission: ${permission}`);
      }
    }
    
    return true;
  }
}
```

## Horizonte Template Integration

### Unknown Section Handling
```javascript
// Horizonte parser with plugin support
class HorizonteParser {
  constructor(pluginManager, showPlaceholders = false) {
    this.pluginManager = pluginManager;
    this.showPlaceholders = showPlaceholders;
  }
  
  parseSection(sectionString) {
    const { component, variant, props } = this.extractSectionInfo(sectionString);
    
    // Check if section exists in core
    if (this.coreSections.has(component)) {
      return this.coreSections.get(component);
    }
    
    // Check if section exists in plugins
    if (this.pluginManager.hasSection(component)) {
      return this.pluginManager.getSection(component);
    }
    
    // Handle unknown section
    if (this.showPlaceholders) {
      return this.createPluginPlaceholder(component, variant, props);
    } else {
      // Skip unknown section silently
      return null;
    }
  }
  
  createPluginPlaceholder(component, variant, props) {
    return {
      component: 'MissingPluginPlaceholder',
      props: {
        sectionName: component,
        variant,
        props,
        installUrl: this.getPluginInstallUrl(component)
      }
    };
  }
}
```

### Missing Plugin Placeholder Component
```svelte
<!-- MissingPluginPlaceholder.svelte -->
<script>
  let { sectionName, variant, installUrl } = $props();
</script>

<div class="alert alert-warning">
  <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
  <div>
    <h3>Missing Plugin</h3>
    <div class="text-xs">
      Section '[{sectionName}:{variant}]' requires a plugin that isn't installed.
    </div>
  </div>
  <div>
    {#if installUrl}
      <a href={installUrl} class="btn btn-sm btn-primary">Install Plugin</a>
    {:else}
      <span class="text-xs opacity-70">Plugin not available</span>
    {/if}
  </div>
</div>
```

## Plugin Distribution & Installation

### Phase 1: Basic Distribution (MVP)
```yaml
Method: GitHub Releases + Manual Installation
Process:
  1. Developer creates plugin package
  2. Signs with CeLeste CLI tool  
  3. Publishes to GitHub releases
  4. Users install via admin interface or CLI

Commands:
  # Developer workflow
  celeste plugin create my-plugin
  celeste plugin sign my-plugin.celeste
  
  # User installation  
  celeste plugin install github:username/plugin-name
  celeste plugin install ./my-plugin.celeste
```

### Phase 2: Plugin Store (Pro)
```yaml
Method: Centralized CeLeste Plugin Store
Features:
  - One-click installation
  - Automatic updates
  - Security scanning
  - Developer revenue sharing
  - User reviews and ratings
  - Plugin discovery and search
```

### Phase 3: Enterprise Distribution (SaaS)
```yaml
Method: Private plugin repositories
Features:
  - Corporate plugin approval workflows
  - Custom security policies  
  - Plugin audit logging
  - Internal plugin development tools
```

## Admin Interface Integration

### Plugin Settings Toggle
```svelte
<!-- Admin Settings: Plugin Configuration -->
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Show missing plugin placeholders</span>
    <input 
      type="checkbox" 
      class="toggle" 
      bind:checked={showMissingPlugins}
      onchange={updatePluginSettings}
    />
  </label>
  <div class="label">
    <span class="label-text-alt">
      Display placeholders for plugin sections that aren't installed
    </span>
  </div>
</div>

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Plugin security level</span>
    <select class="select select-bordered" bind:value={pluginSecurityLevel}>
      <option value="low">Allow all plugins</option>
      <option value="medium">Warn for unsigned plugins</option>
      <option value="high">Only signed plugins</option>
    </select>
  </label>
</div>
```

### Plugin Management Interface
```svelte
<!-- /admin/plugins page -->
<div class="cms-page-header">
  <div>
    <h1>Plugin Management</h1>
    <p>Manage installed plugins and discover new ones</p>
  </div>
  <button class="btn btn-primary" onclick={() => showInstallModal = true}>
    Install Plugin
  </button>
</div>

<div class="cms-grid-content">
  <!-- Installed Plugins -->
  <div class="cms-card md:col-span-2">
    <div class="cms-card-body">
      <h2>Installed Plugins</h2>
      
      {#each installedPlugins as plugin}
        <div class="card card-compact bg-base-100 border">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">{plugin.name}</h3>
                <p class="text-sm opacity-70">{plugin.description}</p>
                <div class="badge badge-{plugin.tier === 'official' ? 'success' : plugin.tier === 'verified' ? 'warning' : 'error'} badge-sm">
                  {plugin.tier}
                </div>
              </div>
              <div class="dropdown dropdown-end">
                <button class="btn btn-ghost btn-sm">⋮</button>
                <ul class="dropdown-content menu">
                  <li><a onclick={() => configurePlugin(plugin)}>Configure</a></li>
                  <li><a onclick={() => reloadPlugin(plugin)}>Reload</a></li>
                  <li><a onclick={() => uninstallPlugin(plugin)}>Uninstall</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Plugin Statistics -->
  <div class="cms-card">
    <div class="cms-card-body">
      <h3>Plugin Statistics</h3>
      <div class="stats stats-vertical">
        <div class="stat">
          <div class="stat-title">Installed</div>
          <div class="stat-value text-primary">{installedPlugins.length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Active</div>
          <div class="stat-value text-secondary">{activePlugins.length}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Updates</div>
          <div class="stat-value text-accent">{updatesAvailable}</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Development Workflow

### Plugin Development Kit (PDK)
```bash
# Create new plugin
celeste plugin create my-awesome-plugin
cd my-awesome-plugin

# Development server with hot reload
celeste plugin dev

# Test plugin in local CeLeste instance
celeste plugin test

# Build and sign plugin
celeste plugin build
celeste plugin sign

# Publish to GitHub
celeste plugin publish
```

### Plugin Template Structure
```javascript
// Plugin template generated by CLI
export default class MyAwesomePlugin {
  constructor(api) {
    this.api = api;
    this.name = 'my-awesome-plugin';
  }
  
  async initialize() {
    // Plugin initialization logic
    await this.setupDatabase();
    this.registerHooks();
  }
  
  async cleanup() {
    // Cleanup when plugin is unloaded
    this.unregisterHooks();
  }
  
  // Horizonte sections provided by this plugin
  getSections() {
    return {
      'my-section': MySectionComponent
    };
  }
  
  // Admin interface components
  getAdminComponents() {
    return {
      'MyAdminComponent': MyAdminComponent
    };
  }
  
  // API endpoints
  getAPIHandlers() {
    return {
      '/api/my-plugin': this.handleAPI.bind(this)
    };
  }
  
  async handleAPI(request) {
    // API logic
  }
  
  async setupDatabase() {
    // Database setup
  }
  
  registerHooks() {
    this.api.hooks.register('post.created', this.onPostCreated.bind(this));
  }
  
  onPostCreated(post) {
    // Handle post creation
  }
}
```

## Security Considerations

### Plugin Sandboxing
- **Database Access**: Plugins can only access their own tables + explicitly allowed core tables
- **File System**: Limited to plugin directory and approved upload paths
- **Network Access**: Configurable restrictions on external API calls
- **Core API**: Permission-based access to CeLeste core functionality

### Permission System
```javascript
// Plugin permission validation
const permissions = {
  'database.read': 'Read access to core database tables',
  'database.write': 'Write access to core database tables', 
  'database.create': 'Create new database tables',
  'api.create': 'Create new API endpoints',
  'admin.create': 'Add new admin interface pages',
  'hooks.register': 'Register event hooks',
  'files.upload': 'Handle file uploads',
  'email.send': 'Send emails via CeLeste email service',
  'external.api': 'Make external API calls',
  'user.impersonate': 'Act on behalf of users (dangerous)'
};
```

### Code Signing Process
```bash
# Developer signs plugin with private key
celeste plugin sign my-plugin.celeste --key ~/.celeste/dev-key.pem

# CeLeste verifies signature on installation
celeste plugin verify my-plugin.celeste --trust-level medium
```

## Future Enhancements

### Plugin Marketplace
- Visual plugin discovery interface
- Plugin ratings and reviews
- Automatic security scanning
- Developer analytics and revenue sharing
- Plugin update management
- A/B testing for plugin performance

### Advanced Security Features
- Runtime behavior monitoring
- Machine learning-based malicious code detection
- Plugin reputation system based on community feedback
- Automated vulnerability scanning
- Integration with security advisory databases

### Developer Experience Enhancements
- Visual plugin development IDE
- Plugin testing framework with mock environments
- Performance profiling tools for plugins
- Plugin dependency management
- Collaborative plugin development tools

---

**Last Updated**: August 2025  
**Status**: Architecture Design Complete - Ready for Implementation  
**Security Model**: Progressive 3-tier approach with signed packages and permissions  
**Integration**: Seamless Horizonte template system integration with hot-loading capabilities