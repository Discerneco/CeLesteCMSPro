# CeLesteCMS Pro Backup System

## Overview

The CeLesteCMS Pro backup system provides comprehensive protection for your project through multiple backup strategies:

- **File System Backup**: Smart backup of critical project files excluding regeneratable content
- **Git Repository Backup**: Safe backup of all branches, tags, and commit history  
- **Database Backup**: Protection of SQLite databases and user data
- **Automated Recovery**: One-command restoration with dependency rebuilding

## Quick Start

```bash
# Create a complete backup
./scripts/backup.sh

# Backup git repository to remote and bundle
./scripts/git-backup.sh

# Restore from backup (interactive selection)
./scripts/restore.sh

# View available backups
./scripts/restore.sh --help
```

## Backup Scripts

### 1. File System Backup (`backup.sh`)

Creates timestamped backups of critical project files while excluding regeneratable content.

#### What's Included:
- Source code (`src/`)
- Configuration files (`package.json`, `svelte.config.js`, etc.)
- Database files (`*.db*`)
- Static assets (`static/`)
- Uploaded media (`static/uploads/`)
- Internationalization (`messages/`)
- Database migrations (`drizzle/`)
- Documentation (`Documentation/`)
- Git repository (`.git/`)

#### What's Excluded:
- `node_modules/` (can be regenerated with `npm install`)
- `.svelte-kit/` (build artifacts)
- `build/`, `dist/`, `.output/` (build outputs)
- Cache files and logs
- Temporary files
- Environment variables (`.env` files)

#### Usage:

```bash
# Basic backup
./scripts/backup.sh

# Verbose output showing file progress
./scripts/backup.sh --verbose

# Quiet mode (errors only)
./scripts/backup.sh --quiet

# Keep backups for 14 days instead of default 7
./scripts/backup.sh --days 14
```

#### Features:
- **Smart Exclusions**: Only backs up critical files, saving 95% space
- **Progress Tracking**: Shows real-time backup progress
- **Integrity Verification**: Validates backup completeness
- **Auto Cleanup**: Removes backups older than specified days
- **Backup Manifest**: Detailed log of what was backed up
- **Size Optimization**: 525MB project → ~22MB backup

### 2. Restoration Script (`restore.sh`)

Restores selected backup with automatic dependency rebuilding.

#### Usage:

```bash
# Interactive backup selection
./scripts/restore.sh

# Restore specific backup
./scripts/restore.sh --backup backup_20250809_1400

# Restore to different location
./scripts/restore.sh --target /path/to/new/project

# Force restore without confirmation
./scripts/restore.sh --force

# Skip dependency installation
./scripts/restore.sh --skip-deps
```

#### Features:
- **Interactive Selection**: Browse and select from available backups
- **Auto Dependencies**: Detects and runs `pnpm`, `yarn`, or `npm install`
- **Database Restoration**: Safely restores database files with backup copies
- **Verification**: Checks critical files and directories after restore
- **Progress Reports**: Detailed restoration report with next steps
- **Safety Checks**: Warns before overwriting existing projects

### 3. Git Backup Script (`git-backup.sh`)

Ensures your Git repository is safely backed up both remotely and locally.

#### Usage:

```bash
# Standard git backup
./scripts/git-backup.sh

# Create backup with tag
./scripts/git-backup.sh --tag "Pre-deployment backup"

# Force push (use with caution)
./scripts/git-backup.sh --force

# Skip remote operations (bundle only)
./scripts/git-backup.sh --skip-remote
```

#### Features:
- **Remote Sync**: Pushes all local branches to remote repository
- **Git Bundles**: Creates portable repository backups
- **Backup Tags**: Optional tagged snapshots for major milestones
- **Bundle Verification**: Ensures bundle integrity
- **Sync Status**: Reports which branches are in sync with remote
- **Auto Cleanup**: Keeps last 10 bundles, removes older ones

## Backup Locations

### File System Backups
```
../CeLesteCMS-Backups/
├── backup_20250809_1400/           # Timestamped backup
│   ├── src/                        # Project files
│   ├── package.json
│   ├── static/
│   └── backup_manifest.txt         # Backup details
├── backup_20250808_1200/
└── backup_history.log              # All backup records
```

### Git Backups
```
../CeLesteCMS-Git-Backups/
├── celestecms-bundle-20250809_1400.git    # Git bundle file
├── bundle-manifest-20250809_1400.txt      # Bundle details
└── sync-status-20250809_1400.txt          # Remote sync report
```

## Automated Backup Scheduling

### macOS (using launchd)

1. Create launch agent:
```bash
mkdir -p ~/Library/LaunchAgents
```

2. Create `~/Library/LaunchAgents/com.celestecms.backup.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.celestecms.backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/csfalcao/Documents/Projects/CeLesteCMS Pro/scripts/backup.sh</string>
        <string>--quiet</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>WorkingDirectory</key>
    <string>/Users/csfalcao/Documents/Projects/CeLesteCMS Pro</string>
</dict>
</plist>
```

3. Load the agent:
```bash
launchctl load ~/Library/LaunchAgents/com.celestecms.backup.plist
```

### Linux (using cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/CeLesteCMS\ Pro/scripts/backup.sh --quiet

# Add weekly git backup on Sundays at 3 AM  
0 3 * * 0 /path/to/CeLesteCMS\ Pro/scripts/git-backup.sh --quiet
```

## Recovery Scenarios

### Scenario 1: Accidental File Deletion
```bash
# Quick file recovery
./scripts/restore.sh --backup backup_20250809_1400

# Or restore specific files manually
rsync -av ../CeLesteCMS-Backups/backup_20250809_1400/src/routes/ ./src/routes/
```

### Scenario 2: Development Environment Corruption
```bash
# Full environment restoration
./scripts/restore.sh
# Select latest backup, script will rebuild node_modules automatically
```

### Scenario 3: Git Repository Issues
```bash
# Restore from git bundle
git clone ../CeLesteCMS-Git-Backups/celestecms-bundle-20250809_1400.git recovered-project
cd recovered-project
git remote add origin <your-remote-url>
```

### Scenario 4: Database Corruption
```bash
# Database files are included in backups
# After restore, database backups are in:
ls -la *.db*
# local.db.restored-20250809_1400  (your restored database)
# local.db                         (current database)
```

### Scenario 5: Complete System Failure
```bash
# On new system:
# 1. Install Node.js, pnpm/npm
# 2. Restore from latest backup
git clone <remote-repo> celestecms-recovery
cd celestecms-recovery
./scripts/restore.sh --backup backup_latest

# Or restore from bundle if remote unavailable:
git clone /path/to/bundle/celestecms-bundle-latest.git celestecms-recovery
cd celestecms-recovery  
pnpm install
```

## Best Practices

### Backup Frequency
- **File System**: Daily automated backups
- **Git Repository**: Before major changes or weekly
- **Manual Backups**: Before deployments, major updates, or risky operations

### Before Major Changes
```bash
# Create snapshot before major work
./scripts/backup.sh --verbose
./scripts/git-backup.sh --tag "Before feature X implementation"
```

### Backup Verification
```bash
# Test restore process monthly
./scripts/restore.sh --target /tmp/restore-test --backup backup_latest

# Verify git bundles
git bundle verify ../CeLesteCMS-Git-Backups/celestecms-bundle-latest.git
```

### Storage Management
- File system backups: ~22MB each (7 days = ~154MB)
- Git bundles: ~5-50MB each (10 bundles = ~50-500MB)
- Total backup storage: ~200-650MB for full retention

## Monitoring and Alerts

### Check Backup Status
```bash
# View backup history
cat ../CeLesteCMS-Backups/backup_history.log

# Check recent backups
ls -la ../CeLesteCMS-Backups/ | head -10

# Verify latest backup integrity
find ../CeLesteCMS-Backups/backup_$(date +%Y%m%d)_* -name "backup_manifest.txt" -exec cat {} \;
```

### Backup Health Script
Create `scripts/check-backups.sh`:
```bash
#!/bin/bash
BACKUP_DIR="../CeLesteCMS-Backups"
LATEST_BACKUP=$(find "$BACKUP_DIR" -maxdepth 1 -name "backup_*" | sort | tail -1)
BACKUP_AGE=$(( ($(date +%s) - $(stat -f %m "$LATEST_BACKUP")) / 86400 ))

if [[ $BACKUP_AGE -gt 2 ]]; then
    echo "WARNING: Latest backup is $BACKUP_AGE days old"
    exit 1
else
    echo "OK: Latest backup is $BACKUP_AGE days old"
    exit 0
fi
```

## Troubleshooting

### Common Issues

#### "Permission denied" errors
```bash
# Fix script permissions
chmod +x scripts/*.sh

# Fix backup directory permissions
chmod -R 755 ../CeLesteCMS-Backups/
```

#### "rsync command not found"
```bash
# macOS
brew install rsync

# Linux
sudo apt install rsync
```

#### Large backup sizes
```bash
# Check what's being backed up
./scripts/backup.sh --verbose | grep "sending incremental"

# Review exclusion patterns in backup.sh
```

#### Restore failures
```bash
# Check backup integrity
find ../CeLesteCMS-Backups/backup_latest/ -name "package.json"

# Manual dependency installation
cd restored-project
pnpm install --frozen-lockfile
```

#### Git bundle issues
```bash
# Verify bundle
git bundle verify ../CeLesteCMS-Git-Backups/celestecms-bundle-latest.git

# List bundle contents
git bundle list-heads ../CeLesteCMS-Git-Backups/celestecms-bundle-latest.git
```

### Emergency Recovery

If all else fails and you need to recover from minimal backups:

1. **Find any backup**: Check `../CeLesteCMS-Backups/`, cloud storage, or git remotes
2. **Recover source code**: Even partial `src/` directory recovery is valuable
3. **Rebuild database**: Use `scripts/db:seed-standalone` to recreate admin user
4. **Restore dependencies**: `pnpm install` will rebuild `node_modules`
5. **Check configuration**: Verify `svelte.config.js`, `tailwind.config.js`, etc.

## Security Considerations

### Backup Security
- Backups contain database files with user data
- Environment files (`.env`) are excluded by design
- Local backups inherit filesystem permissions
- Git bundles contain full repository history

### Best Practices
- Store backups on encrypted drives
- Don't commit backup files to git repositories
- Regularly test restoration procedures
- Use separate backup locations for critical data
- Consider cloud storage for off-site backups

## Integration with Development Workflow

### Pre-commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Optional: Create backup before significant commits
if git diff --cached --name-only | grep -E "(package\.json|svelte\.config\.js)" >/dev/null; then
    echo "Creating backup before package changes..."
    ./scripts/backup.sh --quiet
fi
```

### Deployment Pipeline
```bash
# Before deployment
./scripts/backup.sh
./scripts/git-backup.sh --tag "Pre-deployment $(date +%Y%m%d)"

# After successful deployment  
./scripts/backup.sh
```

---

## Support

For backup system issues:
1. Check script logs and error messages
2. Verify file permissions and disk space
3. Test with verbose mode (`--verbose`) for detailed output
4. Review this documentation for common solutions
5. Create an issue in the project repository

The backup system is designed to be robust and self-healing. Regular testing of restoration procedures ensures your data protection strategy remains effective.