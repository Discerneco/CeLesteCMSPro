#!/bin/bash

# Phase 1 Better Auth Testing Script
# This script validates the Better Auth integration

echo "🧪 CeLesteCMS Pro - Phase 1 Better Auth Testing"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Pre-flight checks..."

# Check if Better Auth is installed
if ! grep -q "better-auth" package.json; then
    echo "❌ Better Auth not found in dependencies"
    exit 1
fi
echo "✅ Better Auth dependency found"

# Check if environment variables are set
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

if ! grep -q "BETTER_AUTH_SECRET" .env; then
    echo "❌ BETTER_AUTH_SECRET not found in .env"
    exit 1
fi
echo "✅ Environment variables configured"

# Check if required files exist
required_files=(
    "src/lib/stores/auth.ts"
    "src/lib/auth-client.ts"
    "src/lib/server/auth.ts"
    "src/routes/api/auth/[...all]/+server.ts"
    "src/lib/server/db/create-better-auth-user.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done
echo "✅ All required files present"

echo ""
echo "🗄️  Database setup..."

# Push database schema
echo "📤 Pushing database schema..."
if ! pnpm run db:push > /dev/null 2>&1; then
    echo "❌ Failed to push database schema"
    exit 1
fi
echo "✅ Database schema updated"

# Create Better Auth user
echo "👤 Creating Better Auth test user..."
if ! pnpm run db:create-auth-user > /dev/null 2>&1; then
    echo "❌ Failed to create test user"
    exit 1
fi
echo "✅ Test user created (admin@example.com / password)"

echo ""
echo "🔍 Code validation..."

# Check TypeScript compilation
echo "🔧 Checking TypeScript compilation..."
if ! pnpm run check > /dev/null 2>&1; then
    echo "❌ TypeScript compilation failed"
    echo "Run 'pnpm run check' for details"
    exit 1
fi
echo "✅ TypeScript compilation successful"

echo ""
echo "🎉 Phase 1 Setup Complete!"
echo "=========================="
echo ""
echo "🚀 Next steps:"
echo "1. Start the development server: pnpm run dev"
echo "2. Navigate to: http://localhost:5173/admin"
echo "3. Login with:"
echo "   📧 Email: admin@example.com"
echo "   🔑 Password: password"
echo ""
echo "✅ Everything is ready for testing!"
echo ""
echo "📝 Manual testing checklist:"
echo "   □ Redirect to login when accessing /admin"
echo "   □ Successful login with test credentials"
echo "   □ Redirect to admin dashboard after login"
echo "   □ Logout functionality works"
echo "   □ Session persists across browser refresh"
echo "   □ Invalid credentials show error message"
echo ""

exit 0
