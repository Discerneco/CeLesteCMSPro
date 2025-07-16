#!/bin/bash

echo "🔄 Committing UI styling improvements..."

# Add all changes
git add -A

# Create commit
git commit -m "fix: Restore transparent badge styling using DaisyUI best practices

- Fix UI styling regression from framework modernization
- Replace solid badges with DaisyUI badge-soft variants for transparency
- Update stats card badges: badge-success → badge-soft badge-success
- Update system status alert: alert-success → alert-success alert-soft  
- Update operational badges: badge-success → badge-soft badge-success
- Use DaisyUI Priority 1 approach (built-in variants) over custom CSS
- Maintain theme compatibility and future-proof implementation
- Add comprehensive CLAUDE.md documentation with development guidelines
- Update CHANGELOG.md with detailed UI styling fix documentation

User experience improvements:
- Restored original transparent green \"bubble\" styling around stats numbers
- Fixed system operational alert background transparency
- Consistent badge styling across all admin dashboard components

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ UI styling improvements committed successfully!"

# Push to remote
echo "🚀 Pushing to remote repository..."
git push origin main

echo "✅ Changes pushed to remote repository!"