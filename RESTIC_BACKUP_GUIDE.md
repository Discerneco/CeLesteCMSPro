# CeLesteCMS Pro - Restic Backup Guide

## ✅ **System Overview**

Professional backup solution using **Restic** - the industry-standard encrypted backup tool.

**Key Benefits:**
- **Size**: 525MB project → ~29MB backups (95% reduction)
- **Speed**: Incremental backups complete in under 1 minute
- **Security**: AES-256 encryption with secure keychain password storage
- **Automation**: Daily backups at 2:00 AM via macOS LaunchAgent
- **Recovery**: Professional restore with safety checks

---

## 🚀 **Quick Commands**

### Daily Use
```bash
./backup-restic.sh                    # Manual backup now
./restore-restic.sh                   # Interactive restore
./manage-backup-service.sh status     # Check automation status
```

### Service Management
```bash
./manage-backup-service.sh install    # Install daily automation
./manage-backup-service.sh start      # Start service
./manage-backup-service.sh stop       # Stop service  
./manage-backup-service.sh uninstall  # Remove automation
```

---

## 📁 **What Gets Backed Up**

### ✅ **INCLUDED** (~29MB)
- **Source Code**: `src/`, all project files
- **Database**: `local.db*` files, `drizzle/` migrations
- **Media**: `static/uploads/`, `static/` assets
- **Configuration**: `package.json`, `svelte.config.js`, etc.
- **Documentation**: `Documentation/`, `*.md` files
- **Messages**: `messages/` (i18n files)

### ❌ **EXCLUDED** (~496MB saved)
- `node_modules/` (regenerated with `pnpm install`)
- `.svelte-kit/`, `build/`, `dist/` (build artifacts)
- Log files, cache files, temporary files
- `.DS_Store`, `*.log`, `.env` files

---

## 🔧 **Backup Storage & Security**

**Location**: `~/CeLesteCMS-Backups/restic-repo/`
- Encrypted AES-256 repository
- Password stored securely in macOS Keychain
- Automatic deduplication and compression
- Rolling retention: 7 daily, 4 weekly, 6 monthly snapshots

**Access Repository**:
```bash
# Password retrieved automatically from keychain
export RESTIC_REPOSITORY=~/CeLesteCMS-Backups/restic-repo
export RESTIC_PASSWORD_COMMAND="security find-generic-password -a restic_backup -s backup-restic-repository -w"

# Manual Restic commands
restic snapshots                      # List all backups
restic check                         # Verify repository integrity
restic forget --prune               # Clean old snapshots
```

---

## 🛠️ **Script Details**

### `backup-restic.sh`
- **Pre-flight checks**: Repository access, disk space
- **Progress tracking**: Real-time backup progress
- **Error handling**: Comprehensive validation at each step
- **Logging**: Detailed logs in `~/CeLesteCMS-Backups/logs/`
- **Cleanup**: Automatic old snapshot removal
- **Options**: `--quick` for faster backups

### `restore-restic.sh`
- **Interactive menu**: Choose from available snapshots
- **Safety first**: Restores to temp directory by default
- **Verification**: Confirms restore integrity
- **Options**: `--target DIR` for custom location

### `manage-backup-service.sh`
- **Service control**: Install/uninstall daily automation
- **Status monitoring**: Check if backups are running
- **Logs access**: View backup history and errors

---

## 📅 **Automation Schedule**

**Daily Backups**: 2:00 AM via macOS LaunchAgent
- Service: `com.celestecms.backup.plist`
- Logs: `~/CeLesteCMS-Backups/logs/daily-backup.log`
- Silent operation: Only logs errors

**Check Service Status**:
```bash
./manage-backup-service.sh status
# Shows: Service status, last run time, recent logs
```

---

## 🚨 **Recovery Scenarios**

### **Scenario 1: Restore Recent Changes**
```bash
./restore-restic.sh
# Choose recent snapshot, restore to temp directory, copy needed files
```

### **Scenario 2: Complete Project Recovery**
```bash
./restore-restic.sh --target ~/Desktop/CeLesteCMS-Recovered
cd ~/Desktop/CeLesteCMS-Recovered
pnpm install  # Rebuild node_modules
pnpm dev      # Test recovery
```

### **Scenario 3: Specific File Recovery**
```bash
# Manual Restic command for individual files
restic restore latest --target temp --include "src/routes/admin/posts/+page.svelte"
```

---

## 📊 **Backup Performance**

**Typical Backup Times**:
- Initial backup: 2-3 minutes (~29MB)
- Daily incremental: 15-30 seconds (only changed files)
- Repository check: 30-60 seconds

**Storage Efficiency**:
- Original project: 525MB
- Backup size: ~29MB (95% reduction)
- With deduplication: Even smaller for multiple snapshots

---

## 🔍 **Troubleshooting**

### **Backup Fails**
1. Check disk space: `df -h ~/CeLesteCMS-Backups`
2. Verify keychain access: `security find-generic-password -s backup-restic-repository`
3. Test repository: `restic check`
4. Check logs: `tail -f ~/CeLesteCMS-Backups/logs/backup-*.log`

### **Service Not Running**
```bash
./manage-backup-service.sh status    # Check current status
./manage-backup-service.sh restart   # Restart if needed
launchctl list | grep celestecms     # Verify LaunchAgent
```

### **Password Issues**
```bash
# Re-add password to keychain
security add-generic-password -s backup-restic-repository -a restic_backup -w
# Enter your backup password when prompted
```

---

## 📈 **Monitoring & Maintenance**

### **Weekly Health Check**
```bash
# Verify backup integrity
export RESTIC_REPOSITORY=~/CeLesteCMS-Backups/restic-repo
export RESTIC_PASSWORD_COMMAND="security find-generic-password -a restic_backup -s backup-restic-repository -w"
restic check

# View backup history
restic snapshots --compact
```

### **Monthly Cleanup**
```bash
# Manual cleanup if needed (automatic in backup script)
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
```

### **Storage Monitoring**
```bash
# Check repository size
du -sh ~/CeLesteCMS-Backups/restic-repo

# Check available space
df -h ~/CeLesteCMS-Backups
```

---

## 🎯 **Best Practices**

1. **Test Restores Monthly**: Verify backups work by doing test restores
2. **Monitor Service**: Check backup service status weekly
3. **Keep Multiple Locations**: Consider adding cloud storage backend
4. **Document Changes**: Update this guide when modifying backup strategy
5. **Secure Passwords**: Never share or write down backup passwords

---

## 🆘 **Emergency Contacts**

- **Repository Location**: `~/CeLesteCMS-Backups/restic-repo/`
- **Password Storage**: macOS Keychain (service: backup-restic-repository)
- **Logs Directory**: `~/CeLesteCMS-Backups/logs/`
- **Service Name**: `com.celestecms.backup`

**If All Else Fails**: The Restic repository is self-contained and portable. You can copy the entire `~/CeLesteCMS-Backups/` directory to another machine and restore from there.

---

*This backup system protects your CeLesteCMS Pro project with professional-grade security and reliability. Your code, database, and media are safe!*