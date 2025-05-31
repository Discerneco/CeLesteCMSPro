#!/bin/bash

echo "🧹 Clearing CeLesteCMS Pro caches..."

# Stop any running dev server
echo "📊 Stopping dev server..."
pkill -f "vite"

# Clear SvelteKit cache
echo "🗑️ Clearing SvelteKit cache..."
rm -rf .svelte-kit

# Clear Vite cache
echo "🗑️ Clearing Vite cache..."
rm -rf node_modules/.vite

# Clear any other temp files
echo "🗑️ Clearing temp files..."
rm -rf .temp
rm -rf dist

echo "✅ All caches cleared!"
echo ""
echo "🚀 Now run: pnpm dev"
echo "📝 Then visit: http://localhost:5173/admin/login"
echo ""
echo "💡 Also clear browser cache (Cmd+Shift+R or F12 > Network > Disable cache)"
