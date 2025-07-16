#!/bin/bash

echo "🔄 Committing framework modernization changes..."

# Add all changes
git add -A

# Create commit
git commit -m "feat: Complete framework modernization to 2025 best practices

- Update all frameworks to latest 2025 versions and patterns
- SvelteKit 2.22.5: WebSocket support, async routing, Vite 7 compatibility
- Svelte 5.35.6: Complete runes implementation (\$state, \$effect, \$derived)
- TailwindCSS 4.1.11: CSS-first configuration with Oxide engine performance
- DaisyUI 5.0.46: Modern theme system with TailwindCSS 4 compatibility
- Drizzle ORM 0.44.2: Latest with 2025 features and optimal SQLite config
- Paraglide i18n 2.0: Modernized flat message structure and universal i18n

Key improvements:
- Migrated from nested to flat semantic message naming
- Removed legacy tailwind.config.js (replaced by CSS-first approach)
- Updated all components to use consistent Svelte 5 runes
- Modern DaisyUI data-theme attributes implementation
- Universal reactivity with fine-grained updates
- Enhanced performance across all frameworks

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ Framework modernization committed successfully!"

# Push to remote
echo "🚀 Pushing to remote repository..."
git push origin main

echo "✅ Changes pushed to remote repository!"