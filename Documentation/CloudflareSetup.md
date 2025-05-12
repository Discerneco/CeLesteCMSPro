# Cloudflare Setup Guide for CeLesteCMS Pro

This guide will walk you through setting up Cloudflare D1 database and deploying your CeLesteCMS Pro application with authentication.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Node.js and npm

## Step 1: Login to Cloudflare via Wrangler

```bash
npx wrangler login
```

This will open a browser window where you can authenticate with your Cloudflare account.

## Step 2: Create a D1 Database

```bash
npx wrangler d1 create celestecms-db
```

This will output something like:
```
✅ Successfully created DB 'celestecms-db' in location 'enam'
Created database 'celestecms-db' with ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Take note of the database ID, you'll need it for the next step.

## Step 3: Update wrangler.toml

Edit your `wrangler.toml` file to include the D1 database configuration:

```toml
# CeLesteCMS Pro Cloudflare Configuration
name = "celestecms-pro"
compatibility_date = "2025-05-12"

# Configure Cloudflare Pages
[site]
bucket = ".svelte-kit/cloudflare"

# Configure Cloudflare D1 Database
[[d1_databases]]
binding = "DB"
database_name = "celestecms-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # Replace with your actual database ID

# Environment Variables
[vars]
# Public variables can be defined here
# Private variables should be set in the Cloudflare Dashboard or using wrangler
```

## Step 4: Create Database Schema

```bash
npx wrangler d1 execute celestecms-db --file=./schema.sql
```

Create a file called `schema.sql` with the following content:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME,
  updated_at DATETIME
);
```

## Step 5: Create an Admin User

Create a file called `create-admin.js` with the following content:

```javascript
// create-admin.js
const { createId } = require('@paralleldrive/cuid2');
const { sha256 } = require('@noble/hashes/sha256');
const { bytesToHex } = require('@noble/hashes/utils');

// Replace these with your desired admin credentials
const email = 'admin@celeste.cms';
const password = 'adminpassword';
const name = 'Admin User';

// Hash the password (same logic as in auth.ts)
function hashPassword(password) {
  const salt = process.env.PASSWORD_SALT || 'default-salt-for-development';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = sha256(data);
  return bytesToHex(hash);
}

const passwordHash = hashPassword(password);
const id = createId();
const now = new Date().toISOString();

// SQL to insert the admin user
const sql = `
INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('${id}', '${email}', '${passwordHash}', '${name}', 'admin', '${now}', '${now}')
`;

console.log(sql);
```

Run this script to generate the SQL:

```bash
PASSWORD_SALT="your-secure-salt" node create-admin.js > admin-user.sql
```

Then execute the SQL to create the admin user:

```bash
npx wrangler d1 execute celestecms-db --file=./admin-user.sql
```

## Step 6: Set Environment Variables

Set the required environment variables for your application:

```bash
npx wrangler secret put PASSWORD_SALT
# Enter your secure salt when prompted

npx wrangler secret put JWT_SECRET
# Enter your JWT secret when prompted
```

## Step 7: Deploy to Cloudflare Pages

Build your SvelteKit application:

```bash
npm run build
```

Deploy to Cloudflare Pages:

```bash
npx wrangler pages deploy .svelte-kit/cloudflare
```

## Step 8: Test Your Authentication

1. Visit your deployed application at the URL provided by Cloudflare Pages
2. Navigate to `/admin/login`
3. Log in with the admin credentials you created:
   - Email: admin@celeste.cms
   - Password: adminpassword

## Local Development with D1

For local development with D1, you can use:

```bash
npx wrangler d1 create celestecms-db --local
```

And then run your development server with:

```bash
npx wrangler pages dev --d1=celestecms-db
```

This will create a local SQLite database that mimics D1 for development purposes.

## Troubleshooting

- **Authentication Issues**: Check that your PASSWORD_SALT and JWT_SECRET environment variables are set correctly
- **Database Connection Issues**: Verify your D1 database ID in wrangler.toml
- **Deployment Issues**: Check the Cloudflare Pages deployment logs for errors

## Next Steps

- Set up CI/CD for automated deployments
- Configure custom domains in the Cloudflare Dashboard
- Implement social authentication providers
