#!/bin/bash

# Clean up temporary files
rm -f cleanup-paraglide.js force-paraglide-regen.js cleanup-temp-files.js

# Remove conflicting Paraglide directory  
rm -rf src/paraglide

# Clear current lib/paraglide to force regeneration
rm -rf src/lib/paraglide

echo "✅ Cleaned up. Restart dev server to regenerate Paraglide files."