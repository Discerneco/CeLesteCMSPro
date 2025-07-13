#!/bin/bash

# 🔄 CeLesteCMS Pro - Revert to Working Paraglide 1.8 Configuration
echo "🔄 Reverting to stable Paraglide 1.8 configuration..."

# Step 1: Restore working package.json dependencies  
echo "📦 Step 1: Updating package.json..."
# You'll need to manually change @inlang/paraglide-js back to 1.8.x

# Step 2: Restore backup files if they exist
echo "🔄 Step 2: Restoring backup files..."
if [ -f "src/lib/stores/i18n.ts.backup" ]; then
    mv src/lib/stores/i18n.ts.backup src/lib/stores/i18n.ts
    echo "   ✅ Restored i18n store"
fi

if [ -f "vite.config.backup.ts" ]; then
    mv vite.config.backup.ts vite.config.ts
    echo "   ✅ Restored vite config"
fi

# Step 3: Clean everything
echo "🧹 Step 3: Cleaning packages and generated files..."
rm -rf node_modules
rm -rf src/lib/paraglide
rm -rf .svelte-kit
rm pnpm-lock.yaml

# Step 4: Install clean packages
echo "📦 Step 4: Fresh install with Paraglide 1.8..."
pnpm install

echo ""
echo "✅ REVERT COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Update package.json to use Paraglide 1.8.x"
echo "2. Configure Paraglide 1.x in vite.config.ts"
echo "3. Use the old i18n pattern that was working"
echo ""
echo "🚀 This will get you back to a working state quickly!"
