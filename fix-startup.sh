#!/bin/bash

# 🚀 CeLesteCMS Pro - Vite Startup Fix Script
# This script resolves the Vite dev server startup issue

echo "🔧 Fixing CeLesteCMS Pro Vite Startup Issue..."
echo "=============================================="

# Step 1: Ensure dependencies are installed
echo "📦 Step 1: Installing dependencies..."
pnpm install

# Step 2: Clean any existing paraglide output
echo ""
echo "🧹 Step 2: Cleaning Paraglide output..."
rm -rf src/lib/paraglide
rm -rf src/paraglide

# Step 3: Compile Paraglide with basic strategy
echo ""
echo "⚙️ Step 3: Compiling Paraglide..."
npx @inlang/paraglide-js compile --project ./project.inlang --outdir ./src/lib/paraglide

# Step 4: Check if compilation succeeded
echo ""
echo "✅ Step 4: Verifying compilation..."
if [ -f "src/lib/paraglide/runtime.js" ]; then
    echo "   ✅ runtime.js generated successfully"
else
    echo "   ❌ runtime.js missing - compilation failed"
fi

if [ -f "src/lib/paraglide/messages.js" ]; then
    echo "   ✅ messages.js generated successfully"
else
    echo "   ❌ messages.js missing - compilation failed"
fi

# Step 5: Try starting the dev server
echo ""
echo "🚀 Step 5: Starting development server..."
echo "If this fails, check the troubleshooting section below."
echo ""

# Don't actually start the server in this script, let user do it manually
echo "Run: pnpm dev"
echo ""

echo "=============================================="
echo "🔍 TROUBLESHOOTING GUIDE"
echo ""
echo "If 'pnpm dev' still fails:"
echo ""
echo "Problem 1: TypeScript errors"
echo "Solution: pnpm run check"
echo ""
echo "Problem 2: Paraglide compilation issues"
echo "Solution: Check your messages/en.json structure"
echo ""
echo "Problem 3: Strategy not supported"
echo "Solution: Try even simpler strategy: ['baseLocale']"
echo ""
echo "Problem 4: Node modules corruption"  
echo "Solution: rm -rf node_modules && pnpm install"
echo ""
echo "Problem 5: Port already in use"
echo "Solution: pnpm dev --port 5174"
echo ""
echo "🆘 EMERGENCY FALLBACK:"
echo "If all else fails, revert to minimal config:"
echo "1. Remove strategy from vite.config.ts completely"
echo "2. Use: paraglideVitePlugin({ project: './project.inlang' })"
echo ""
