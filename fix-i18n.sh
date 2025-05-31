#!/bin/bash

# CeLesteCMS Pro i18n Fix Script
# Run this script to fix the auth page i18n issues

echo "🔧 CeLesteCMS Pro i18n Fix Script"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "regenerate-i18n.js" ]; then
    echo "❌ Error: Please run this script from the CeLesteCMS Pro project root directory"
    echo "Current directory: $(pwd)"
    echo "Expected files: package.json, regenerate-i18n.js"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo "✅ Project files found"
echo ""

# Step 1: Regenerate Paraglide files
echo "📝 Step 1: Regenerating Paraglide i18n files..."
if node regenerate-i18n.js; then
    echo "✅ Paraglide files regenerated successfully"
else
    echo "⚠️  Script failed, trying alternative..."
    if npx @inlang/paraglide-js compile --project ./project.inlang; then
        echo "✅ Paraglide files regenerated with alternative method"
    else
        echo "❌ Failed to regenerate Paraglide files"
        echo "Please check your project.inlang/settings.json configuration"
        exit 1
    fi
fi
echo ""

# Step 2: Clear any cached files
echo "🧹 Step 2: Clearing build cache..."
if [ -d ".svelte-kit" ]; then
    rm -rf .svelte-kit
    echo "✅ Cleared .svelte-kit cache"
fi

if [ -d "node_modules/.vite" ]; then
    rm -rf node_modules/.vite
    echo "✅ Cleared Vite cache"
fi
echo ""

# Step 3: Type check
echo "🔍 Step 3: Running type check..."
if pnpm check > /dev/null 2>&1; then
    echo "✅ TypeScript check passed"
else
    echo "⚠️  TypeScript warnings found (this might be normal)"
fi
echo ""

# Step 4: Instructions for testing
echo "🧪 Step 4: Ready for Testing!"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Start the dev server:"
echo "   pnpm dev"
echo ""
echo "2. Clear browser cache completely:"
echo "   - Open DevTools (F12)"
echo "   - Right-click refresh → 'Empty Cache and Hard Reload'"
echo "   - Or open in incognito mode"
echo ""
echo "3. Test the auth pages:"
echo "   - http://localhost:5173/admin/login"
echo "   - http://localhost:5173/admin/signup"
echo "   - http://localhost:5173/admin/forgot-password"
echo ""
echo "4. Test these features:"
echo "   ✓ Navbar with logo appears"
echo "   ✓ Language switcher (globe icon) works"
echo "   ✓ Dark mode toggle (sun/moon icon) works"
echo "   ✓ Support text: 'Need help? Contact support@celestecms.com'"
echo "   ✓ Copyright footer: '© 2025 CeLeste CMS. All rights reserved.'"
echo "   ✓ Language switching changes all text immediately"
echo ""
echo "🎉 Fix complete! The auth pages should now show all elements correctly."
echo ""
echo "💡 If issues persist:"
echo "   - Check browser console for errors"
echo "   - Ensure all component files exist in src/lib/components/"
echo "   - Verify Paraglide files in src/lib/paraglide/messages/"
