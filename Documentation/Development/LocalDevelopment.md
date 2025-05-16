# Local Development with Cloudflare D1

This guide explains how to set up local development with Cloudflare D1 for CeLesteCMS Pro.

## Prerequisites

- Wrangler CLI installed: `npm install -g wrangler`
- Cloudflare account with D1 access

## Setting Up Local Development

### 1. Create a Local D1 Database

```bash
npx wrangler d1 create celestecms-db --local
```

This creates a local SQLite database that mimics D1 for development.

### 2. Initialize the Database Schema

```bash
npx wrangler d1 execute celestecms-db --local --file=./schema.sql
```

### 3. Create an Admin User

```bash
# Set your password salt environment variable
export PASSWORD_SALT="your-development-salt"

# Generate the SQL for creating an admin user
node create-admin.js > admin-user.sql

# Execute the SQL to create the admin user
npx wrangler d1 execute celestecms-db --local --file=./admin-user.sql
```

### 4. Run the Development Server

```bash
# Start the development server with D1 binding
npx wrangler pages dev --d1=celestecms-db -- npm run dev
```

This command:
1. Starts a local development server
2. Binds your local D1 database to the `DB` environment variable
3. Runs the SvelteKit development server

## Testing Authentication

1. Visit `http://localhost:5173/admin/login`
2. Log in with the admin credentials:
   - Email: admin@celeste.cms (or whatever you set in create-admin.js)
   - Password: adminpassword (or whatever you set in create-admin.js)

## Environment Variables

For local development, you'll need these environment variables:

- `PASSWORD_SALT`: Used for password hashing
- `JWT_SECRET`: Used for signing JWT tokens

You can set these in a `.dev.vars` file in your project root:

```
PASSWORD_SALT=your-development-salt
JWT_SECRET=your-development-jwt-secret
```

Or use the `--env` flag with wrangler:

```bash
npx wrangler pages dev --d1=celestecms-db --env PASSWORD_SALT=your-salt --env JWT_SECRET=your-secret -- npm run dev
```

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database, make sure:

1. You've created the local D1 database with `wrangler d1 create celestecms-db --local`
2. You're running the server with the D1 binding: `--d1=celestecms-db`
3. Your `wrangler.toml` has the correct D1 configuration

### Authentication Issues

If authentication isn't working:

1. Check that your PASSWORD_SALT and JWT_SECRET environment variables are set
2. Verify that the admin user was created successfully
3. Check the browser console and server logs for errors

## Next Steps

Once you've confirmed everything works locally, you can deploy to Cloudflare Pages following the instructions in CloudflareSetup.md.
