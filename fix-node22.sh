#!/bin/bash

# 🔧 Node.js 22 Compatibility Fix for CeLesteCMS Pro
echo "🔧 Fixing Node.js 22 compatibility issues..."

# Step 1: Clear everything
echo "🧹 Clearing package cache and modules..."
rm -rf node_modules
rm -rf .pnpm-store
rm pnpm-lock.yaml

# Step 2: Update pnpm to latest
echo "📦 Updating pnpm..."
npm install -g pnpm@latest

# Step 3: Install with specific flags for Node 22
echo "⚙️ Installing with Node 22 compatibility flags..."
pnpm install --shamefully-hoist --strict-peer-dependencies=false

# Step 4: Try to start
echo "🚀 Attempting to start dev server..."
pnpm dev
