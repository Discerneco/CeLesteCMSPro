# CeLesteCMS Pro - Backup Quick Reference

## 🚀 Quick Commands

### Create Backup
```bash
./scripts/backup-all.sh                # Complete backup (files + git)
./scripts/backup.sh                    # File system backup only
./scripts/git-backup.sh               # Git repository backup only
./scripts/backup-all.sh --tag "v1.0"  # Complete tagged backup
```

### Restore Backup
```bash
./scripts/restore.sh                  # Interactive restore
./scripts/restore.sh --backup backup_20250809_1400  # Specific backup
```

## 📁 What Gets Backed Up

### ✅ **Included** (~22MB)
- Source code (`src/`)  
- Configuration files (`package.json`, `svelte.config.js`, etc.)
- Database files (`*.db*`)
- Static assets (`static/`)
- Media uploads (`static/uploads/`)
- Messages (`messages/`)
- Migrations (`drizzle/`)
- Documentation (`Documentation/`)
- Git repository

### ❌ **Excluded** (~503MB saved)
- `node_modules/` (regenerated automatically)
- `.svelte-kit/`, `build/`, `dist/` (build artifacts)
- Log files, cache files, temporary files
- `.env` files (security)

## 🔧 Common Use Cases

### Before Major Changes
```bash
./scripts/backup-all.sh --tag "Before refactor"  # Single command for everything
```

### Daily Backup  
```bash
./scripts/backup-all.sh --quiet  # Complete backup for cron/scheduled task
./scripts/backup.sh --quiet      # Files only (faster for frequent backups)
```

### Emergency Recovery
```bash
./scripts/restore.sh  # Choose latest backup, dependencies auto-installed
```

### Check Backup Status
```bash
ls -la ../CeLesteCMS-Backups/
cat ../CeLesteCMS-Backups/backup_history.log
```

## 📍 Backup Locations

- **File Backups**: `../CeLesteCMS-Backups/backup_YYYYMMDD_HHMM/`
- **Git Bundles**: `../CeLesteCMS-Git-Backups/celestecms-bundle-YYYYMMDD_HHMM.git`
- **Manifests**: Detailed logs in each backup directory

## ⚡ Script Options

### backup-all.sh (Complete Backup)
- `-t, --tag MSG` - Create backup tag for git portion  
- `--skip-git` - File system backup only
- `--skip-files` - Git backup only
- `-q, --quiet` - Suppress non-error output
- `-v, --verbose` - Show detailed progress

### backup.sh
- `-v, --verbose` - Show detailed progress
- `-q, --quiet` - Errors only
- `-d, --days N` - Keep N days of backups (default: 7)

### restore.sh  
- `-t, --target PATH` - Restore to specific directory
- `-b, --backup NAME` - Restore specific backup
- `-f, --force` - Skip confirmations
- `--skip-deps` - Don't run npm/pnpm install

### git-backup.sh
- `-t, --tag MSG` - Create backup tag
- `-f, --force` - Force push to remote  
- `--skip-remote` - Bundle only, no remote push
- `-v, --verbose` - Detailed output

## 🚨 Emergency Recovery Steps

1. **Find latest backup**: `ls -la ../CeLesteCMS-Backups/`
2. **Restore**: `./scripts/restore.sh`
3. **Verify**: Check app starts with `pnpm dev`
4. **If git issues**: Restore from bundle in `../CeLesteCMS-Git-Backups/`

---
**💡 Tip**: Test your backups monthly by restoring to a temporary directory!