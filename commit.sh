#!/bin/bash

# Add all modified files
git add messages/en.json
git add src/lib/components/LanguageSwitcher.svelte  
git add src/routes/admin/forgot-password/+page.svelte
git add src/routes/admin/login/+page.svelte
git add src/routes/admin/reset-password/+page.svelte
git add src/routes/admin/signup/+page.svelte

# Also add the new script if you want to include it
git add clear-cache.sh

# Commit with a descriptive message
git commit -m "fix: Update localization and improve admin UI consistency

- Fix Paraglide 2.0 compatibility in LanguageSwitcher component
  - Replace deprecated languageTag() with getLocale()
  - Replace setLanguageTag() with setLocale() 
  - Replace availableLanguageTags with locales array
- Update login button text from 'Sign In' to 'Login' in EN messages
- Improve admin pages UI consistency:
  - Standardize navbar across all auth screens
  - Add proper margins to navigation corners
  - Center icons vertically in navbar
  - Enhance visual consistency and user experience
- Add clear-cache.sh utility script

Resolves TypeError: languageTag is not a function
All localization now working correctly with Paraglide 2.0 + Svelte 5"

echo "✅ Changes committed successfully!"
echo "📌 Summary of changes:"
echo "   • Fixed Paraglide 2.0 API compatibility"  
echo "   • Changed login button: 'Sign In' → 'Login'"
echo "   • Improved admin UI consistency"
echo "   • Enhanced navbar styling and alignment"
echo ""
echo "🚀 Ready to push with: git push origin main"
