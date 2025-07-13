#!/bin/bash

echo "🔧 CLEANING UP NON-OFFICIAL CODE"
echo "================================"

echo ""
echo "Removing custom reactive store that's not part of official Paraglide 2.0..."

# Remove the custom i18n store
rm -f "./src/lib/stores/i18n.ts"

echo "✅ Removed: src/lib/stores/i18n.ts"

echo ""
echo "🎯 Official approach now:"
echo "1. ✅ Import: import * as m from '\$lib/paraglide/messages'"
echo "2. ✅ Usage: {#key currentLocale}{m['auth.loginTitle']()}{/key}"
echo "3. ✅ Locale tracking: let currentLocale = \$state(getLocale())"
echo "4. ✅ Reactivity: \$effect(() => { currentLocale = getLocale(); })"

echo ""
echo "🧪 The {#key} pattern forces Svelte to re-render when locale changes"
echo "This should make messages reactive without custom stores"

echo ""
echo "🚀 Test this approach:"
echo "pnpm dev"
