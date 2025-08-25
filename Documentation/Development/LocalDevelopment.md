# Local Development Guide for CeLesteCMS Pro

This guide covers setting up a complete local development environment for CeLesteCMS Pro with the current Oslo + Arctic authentication system and Drizzle ORM.

## Prerequisites

- **Node.js 18+** and **pnpm** package manager
- **Git** for version control
- **SQLite** (for local database)
- **VS Code** (recommended with Svelte extension)

## Quick Setup (5 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd CeLesteCMS-Pro

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Generate and run database migrations
pnpm run db:generate
pnpm run db:migrate

# Seed database with admin user and sample content
pnpm run db:seed-standalone

# Start development server
pnpm run dev
```

Visit `http://localhost:5173/admin/login` and login with:
- **Email**: `admin@example.com`
- **Password**: `adminpassword123`

## Detailed Setup Instructions

### 1. Environment Configuration

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=file:local.db

# Authentication (Oslo + Arctic)
SESSION_SECRET=your-super-secret-session-key-32-chars-minimum

# Email (for password reset)
EMAIL_PROVIDER=console
EMAIL_FROM=noreply@localhost

# Development
NODE_ENV=development
```

**Important**: Generate a secure `SESSION_SECRET` with at least 32 characters for session encryption.

### 2. Database Setup

CeLesteCMS Pro uses Drizzle ORM with SQLite for local development:

```bash
# Generate migration files from schema
pnpm run db:generate

# Apply migrations to create tables
pnpm run db:migrate

# Seed database with sample data and admin user
pnpm run db:seed-standalone

# Optional: Open database in Drizzle Studio
pnpm run db:studio
```

### 3. Understanding the Database

The seed script creates:
- **Admin user**: `admin@example.com` / `adminpassword123`
- **Sample posts**: 3 blog posts with different statuses
- **Categories and tags**: For content organization
- **Settings**: Default site configuration

### 4. Development Server

```bash
# Start development server with hot reload
pnpm run dev

# Development server runs on:
# - Frontend: http://localhost:5173
# - Admin: http://localhost:5173/admin
```

The development server includes:
- **Hot Module Replacement** for instant updates
- **TypeScript checking** with Svelte 5 support
- **Tailwind CSS** with live reloading
- **DaisyUI components** with theme switching

## Development Workflow

### Daily Development Flow

1. **Start the server**: `pnpm run dev`
2. **Make changes**: Edit Svelte components, add features
3. **Test changes**: Visit admin pages and public routes
4. **Database changes**: Use Drizzle ORM migrations
5. **Commit work**: Regular git commits with descriptive messages

### Working with the Admin Interface

Navigate to key admin sections:
- **Dashboard**: `http://localhost:5173/admin` - Overview and stats
- **Posts**: `http://localhost:5173/admin/posts` - Content management
- **Media**: `http://localhost:5173/admin/media` - File uploads
- **Users**: `http://localhost:5173/admin/users` - User management
- **Settings**: `http://localhost:5173/admin/settings` - Site configuration

### Testing Authentication

Test the complete authentication flow:

1. **Login**: Visit `/admin/login` with admin credentials
2. **Session persistence**: Refresh page, should stay logged in
3. **Logout**: Click logout button, should redirect to login
4. **Route protection**: Visit `/admin` without login, should redirect
5. **Password reset**: Test the forgot password flow (emails appear in console)

## Database Development

### Schema Changes

When modifying the database schema:

```bash
# 1. Edit schema in src/lib/server/db/schema.ts
# 2. Generate new migration
pnpm run db:generate

# 3. Apply migration to local database
pnpm run db:migrate

# 4. If needed, update seed data
pnpm run db:seed-standalone
```

### Database Tools

```bash
# Open Drizzle Studio (visual database editor)
pnpm run db:studio

# Reset database (careful - deletes all data!)
rm local.db
pnpm run db:migrate
pnpm run db:seed-standalone

# View database directly
sqlite3 local.db
.tables
.schema users
```

## Internationalization (i18n) 

CeLesteCMS Pro supports English and Portuguese:

### Working with Translations

Edit message files:
- **English**: `messages/en.json`
- **Portuguese**: `messages/pt-br.json`

```bash
# After editing message files, regenerate Paraglide
pnpm run paraglide:compile

# Messages are imported as:
import * as m from '$lib/paraglide/messages';

// Used in components as:
{m.dashboard_title()}
{m.user_menu_profile()}
```

### Testing Language Switching

1. Visit any admin page
2. Click language switcher in top navigation
3. Verify all text changes to selected language
4. Check that URLs maintain language context

## Theme System Testing

Test the complete theme system:

1. **Light/Dark Toggle**: Click theme button in navigation
2. **Color Customization**: Visit Settings > Appearance
3. **Live Preview**: Changes should apply immediately
4. **Persistence**: Refresh page, theme should persist
5. **Cross-page Consistency**: Navigate between pages

## Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Reset database completely
rm local.db
pnpm run db:migrate
pnpm run db:seed-standalone
```

**Authentication Not Working:**
- Check `SESSION_SECRET` is set in `.env`
- Verify admin user exists: `sqlite3 local.db "SELECT * FROM users;"`
- Clear browser localStorage and cookies

**TypeScript Errors:**
```bash
# Regenerate types
pnpm run check
pnpm run build
```

**Port Already in Use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or start on different port
pnpm run dev --port 3000
```

### Development Tips

**VS Code Setup:**
- Install "Svelte for VS Code" extension
- Install "Tailwind CSS IntelliSense" extension
- Enable TypeScript strict mode checking

**Git Workflow:**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make commits with clear messages
git commit -m "feat: add user profile management"

# Push and create PR
git push origin feature/new-feature
```

**Performance Monitoring:**
- Use browser dev tools to check bundle size
- Monitor Svelte compile times
- Check database query performance in logs

## Next Steps

Once local development is working:

1. **Explore the codebase**: Understand the folder structure
2. **Read specialized guides**: DaisyUI implementation, Svelte 5 conversion
3. **Try development tasks**: Create new admin pages, modify components
4. **Test deployment**: Follow CloudflareSetup.md for production deployment

## Support

For development issues:
- **Documentation**: Check other files in this Development folder
- **Email**: pro@celestecms.com  
- **GitHub**: Create issues in the repository

---

**Last Updated**: August 2025  
**Framework Stack**: Svelte 5 + Oslo + Arctic + Drizzle ORM  
**Development Status**: Ready for active development with complete local setup