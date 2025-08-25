# Cloudflare Pages Deployment Guide for CeLesteCMS Pro

This guide covers deploying CeLesteCMS Pro to Cloudflare Pages with D1 database, using our current Oslo + Arctic authentication system and hybrid static/dynamic architecture.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Node.js 18+ and pnpm
- Git repository with CeLesteCMS Pro

## Architecture Overview

CeLesteCMS Pro uses a **hybrid deployment**:
- **Static Pages**: Pre-rendered public blog posts and pages (served from CDN)
- **Dynamic Admin**: Server-side rendered admin interface with authentication
- **Edge Functions**: API endpoints and authentication handling
- **D1 Database**: Serverless SQLite database for all data

## Step 1: Login to Cloudflare

```bash
npx wrangler login
```

This opens a browser window for Cloudflare authentication.

## Step 2: Create D1 Database

```bash
npx wrangler d1 create celestecms-pro-db
```

Output example:
```
✅ Successfully created DB 'celestecms-pro-db' in location 'enam'
Created database 'celestecms-pro-db' with ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Important:** Copy the database ID for the next step.

## Step 3: Configure wrangler.toml

Create or update your `wrangler.toml` file:

```toml
# CeLesteCMS Pro Cloudflare Configuration
name = "celestecms-pro"
compatibility_date = "2025-08-25"

# Configure D1 Database
[[d1_databases]]
binding = "DB"
database_name = "celestecms-pro-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # Replace with your actual ID

# Environment Variables
[vars]
# Public variables only - private vars set via wrangler secret
PUBLIC_APP_NAME = "CeLesteCMS Pro"
```

## Step 4: Set Environment Variables

Set the required environment variables using Wrangler secrets:

```bash
# Session secret for Oslo authentication
npx wrangler secret put SESSION_SECRET
# Enter a strong random string (32+ characters)

# Email provider (console for development, resend/gmail for production)
npx wrangler secret put EMAIL_PROVIDER
# Enter "console" for development or "resend" for production

# If using Resend for production email:
npx wrangler secret put EMAIL_API_KEY
# Enter your Resend API key

# Email from address
npx wrangler secret put EMAIL_FROM
# Enter: noreply@yourdomain.com
```

## Step 5: Run Database Migrations

Apply the database schema using our Drizzle migrations:

```bash
# Apply migrations to remote D1 database
npx wrangler d1 migrations apply celestecms-pro-db
```

If migrations don't exist yet, create them:

```bash
# Generate migrations from schema
pnpm run db:generate

# Apply to remote D1
npx wrangler d1 migrations apply celestecms-pro-db
```

## Step 6: Create Admin User

Use our standalone seed script to create the initial admin user:

```bash
# Create admin user in remote D1 database
DATABASE_URL="remote" pnpm run db:seed-standalone
```

This creates an admin user with:
- **Email**: `admin@example.com`
- **Password**: `adminpassword123`
- **Role**: `admin`

**Important:** Change these credentials after first login!

## Step 7: Build for Production

Build the application for Cloudflare deployment:

```bash
# Install dependencies
pnpm install

# Build for production
pnpm run build
```

This creates optimized assets in `.svelte-kit/cloudflare/` for hybrid deployment.

## Step 8: Deploy to Cloudflare Pages

### Option A: Deploy via Wrangler CLI

```bash
# Deploy the built application
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=celestecms-pro
```

### Option B: Connect GitHub Repository (Recommended)

1. **Push to GitHub** (if not already done)
2. **Go to Cloudflare Dashboard** → Pages → Create Application
3. **Connect to Git** → Select your repository
4. **Configure Build Settings**:
   - **Framework preset**: SvelteKit
   - **Build command**: `pnpm run build`
   - **Build output directory**: `.svelte-kit/cloudflare`
   - **Node.js version**: 18 or higher

5. **Configure Environment Variables** in Cloudflare Dashboard:
   ```
   SESSION_SECRET=your-secret-here
   EMAIL_PROVIDER=console (or resend)
   EMAIL_FROM=noreply@yourdomain.com
   ```

6. **Add D1 Database Binding**:
   - Go to Pages → Your Project → Settings → Functions
   - Add D1 database binding: `DB` → `celestecms-pro-db`

## Step 9: Configure Custom Domain (Optional)

1. **Go to** Cloudflare Dashboard → Pages → Your Project → Custom domains
2. **Add** your domain (e.g., `cms.yourdomain.com`)
3. **Update DNS** records as instructed by Cloudflare

## Step 10: Test Deployment

1. **Visit** your deployed site URL
2. **Navigate to** `/admin/login`
3. **Login** with admin credentials:
   - Email: `admin@example.com`
   - Password: `adminpassword123`
4. **Verify** admin dashboard loads correctly
5. **Test** theme switching and language switching
6. **Check** that logout works properly

## Local Development with Remote D1 (Optional)

To develop locally against the remote D1 database:

```bash
# Create local binding to remote D1
npx wrangler pages dev --d1=DB=celestecms-pro-db

# Or use local development with local D1 copy
npx wrangler d1 execute celestecms-pro-db --local --file=migrations/0001_initial.sql
```

## Troubleshooting

### Authentication Issues
- **Problem**: Login fails or redirects incorrectly
- **Solution**: Check `SESSION_SECRET` is set correctly in environment variables
- **Check**: Verify D1 database has users and sessions tables

### Database Connection Issues
- **Problem**: 500 errors on admin pages
- **Solution**: Verify D1 database binding is named `DB` in both `wrangler.toml` and Cloudflare dashboard
- **Check**: Confirm migrations have been applied with `npx wrangler d1 info celestecms-pro-db`

### Build/Deploy Issues  
- **Problem**: Build fails or assets missing
- **Solution**: Ensure `pnpm run build` completes successfully
- **Check**: Verify `.svelte-kit/cloudflare/` directory contains built files

### Email Issues
- **Problem**: Password reset emails not working
- **Solution**: 
  - For development: Use `EMAIL_PROVIDER=console` and check Cloudflare logs
  - For production: Set up Resend API key and verify EMAIL_FROM domain

## Production Checklist

Before going live:

- [ ] **Change default admin credentials**
- [ ] **Set strong SESSION_SECRET** (32+ random characters)
- [ ] **Configure production email provider** (Resend recommended)
- [ ] **Set up custom domain** with SSL
- [ ] **Test all authentication flows** (login, logout, password reset)
- [ ] **Verify admin functions** work correctly
- [ ] **Test public site generation** and performance
- [ ] **Set up monitoring** via Cloudflare Analytics

## Advanced Configuration

### Multiple Environments

For staging and production environments:

```bash
# Create staging database
npx wrangler d1 create celestecms-pro-staging

# Deploy to staging
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=celestecms-pro-staging
```

### Performance Optimization

CeLesteCMS Pro automatically optimizes for Cloudflare:
- **Static assets** served from global CDN
- **Database queries** optimized for D1
- **Sessions** use HTTP-only cookies
- **API responses** cached where appropriate

## Next Steps

- **Content Creation**: Start creating posts and pages in the admin
- **Theme Customization**: Customize the public site theme
- **Pro Features**: Explore Pro upgrade features for application development
- **Monitoring**: Set up Cloudflare Web Analytics
- **Backups**: Consider automated backup strategies for D1 data

## Support

For deployment issues:
- **Email**: pro@celestecms.com
- **Documentation**: Check other files in this folder
- **GitHub**: Create an issue in the CeLesteCMS Pro repository