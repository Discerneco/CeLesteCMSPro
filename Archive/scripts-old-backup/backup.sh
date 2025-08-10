#!/bin/bash
# CeLesteCMS Pro - Smart Backup Script
# Creates timestamped backups with progress tracking and integrity verification
# Excludes regeneratable files like node_modules, .svelte-kit, etc.

set -e  # Exit on any error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_BASE_DIR="$PROJECT_ROOT/../CeLesteCMS-Backups"
TIMESTAMP=$(date +%Y%m%d_%H%M)
BACKUP_DIR="$BACKUP_BASE_DIR/backup_$TIMESTAMP"
DAYS_TO_KEEP=7
VERBOSE=false
QUIET=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line options
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -d|--days)
            DAYS_TO_KEEP="$2"
            shift 2
            ;;
        -h|--help)
            echo "CeLesteCMS Pro Backup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose    Show detailed progress"
            echo "  -q, --quiet      Suppress all output except errors"
            echo "  -d, --days NUM   Keep backups for NUM days (default: 7)"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "Backup location: $BACKUP_BASE_DIR"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging functions
log_info() {
    if [[ "$QUIET" != true ]]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

log_success() {
    if [[ "$QUIET" != true ]]; then
        echo -e "${GREEN}[SUCCESS]${NC} $1"
    fi
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_verbose() {
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}

# Check if we're in the right directory
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    log_error "Not in a valid CeLesteCMS Pro project directory"
    log_error "Expected to find package.json in: $PROJECT_ROOT"
    exit 1
fi

# Create backup base directory
mkdir -p "$BACKUP_BASE_DIR"
mkdir -p "$BACKUP_DIR"

log_info "Starting backup of CeLesteCMS Pro project"
log_info "Source: $PROJECT_ROOT"
log_info "Destination: $BACKUP_DIR"

# Create rsync exclude file
EXCLUDE_FILE=$(mktemp)
cat > "$EXCLUDE_FILE" << 'EOF'
node_modules/
.svelte-kit/
build/
.output/
.vercel/
.netlify/
.wrangler/
dist/
coverage/
*.log
*.log.*
.DS_Store
Thumbs.db
.env
.env.*
!.env.example
!.env.test
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
.git/hooks/
.git/logs/
.git/refs/remotes/
*.tmp
*.temp
.cache/
.npm/
.pnpm-store/
yarn-error.log
npm-debug.log*
lerna-debug.log*
.nyc_output
.coverage
*.tsbuildinfo
.eslintcache
EOF

# Add backup directories to exclude (prevent recursive backups)
echo "../CeLesteCMS-Backups/" >> "$EXCLUDE_FILE"
echo "backups/" >> "$EXCLUDE_FILE"

log_verbose "Created exclusion list with $(wc -l < "$EXCLUDE_FILE") patterns"

# Count source files (excluding what we're going to exclude)
log_info "Analyzing source files..."
TOTAL_FILES=$(find "$PROJECT_ROOT" -type f | grep -v -f <(sed 's/.*/-e &/' "$EXCLUDE_FILE" | tr '\n' ' ') | wc -l | tr -d ' ')
log_info "Found $TOTAL_FILES files to backup"

# Prepare rsync options
RSYNC_OPTS="-a --delete --delete-excluded --exclude-from=$EXCLUDE_FILE"

if [[ "$VERBOSE" == true ]]; then
    RSYNC_OPTS="$RSYNC_OPTS --progress --stats"
elif [[ "$QUIET" != true ]]; then
    RSYNC_OPTS="$RSYNC_OPTS --info=progress2"
fi

# Perform the backup
log_info "Starting file synchronization..."
if rsync $RSYNC_OPTS "$PROJECT_ROOT/" "$BACKUP_DIR/"; then
    log_success "Files synchronized successfully"
else
    log_error "Backup failed during file synchronization"
    rm -f "$EXCLUDE_FILE"
    exit 1
fi

# Clean up temporary file
rm -f "$EXCLUDE_FILE"

# Create backup manifest
MANIFEST_FILE="$BACKUP_DIR/backup_manifest.txt"
cat > "$MANIFEST_FILE" << EOF
CeLesteCMS Pro Backup Manifest
=============================
Backup Date: $(date '+%Y-%m-%d %H:%M:%S %Z')
Source Path: $PROJECT_ROOT
Backup Path: $BACKUP_DIR
Script Version: 1.0

Project Information:
-------------------
EOF

# Add project info from package.json if available
if [[ -f "$BACKUP_DIR/package.json" ]]; then
    if command -v jq >/dev/null 2>&1; then
        echo "Project Name: $(jq -r '.name // "Unknown"' "$BACKUP_DIR/package.json")" >> "$MANIFEST_FILE"
        echo "Project Version: $(jq -r '.version // "Unknown"' "$BACKUP_DIR/package.json")" >> "$MANIFEST_FILE"
    else
        echo "Project Name: $(grep '"name"' "$BACKUP_DIR/package.json" | head -1 | sed 's/.*"name".*:.*"\([^"]*\)".*/\1/')" >> "$MANIFEST_FILE"
        echo "Project Version: $(grep '"version"' "$BACKUP_DIR/package.json" | head -1 | sed 's/.*"version".*:.*"\([^"]*\)".*/\1/')" >> "$MANIFEST_FILE"
    fi
fi

# Add Git information if available
if [[ -d "$BACKUP_DIR/.git" ]]; then
    echo "" >> "$MANIFEST_FILE"
    echo "Git Information:" >> "$MANIFEST_FILE"
    echo "---------------" >> "$MANIFEST_FILE"
    cd "$BACKUP_DIR"
    echo "Current Branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')" >> "$MANIFEST_FILE"
    echo "Last Commit: $(git log -1 --format='%h - %s (%ci)' 2>/dev/null || echo 'Unknown')" >> "$MANIFEST_FILE"
    echo "Git Status: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ') modified files" >> "$MANIFEST_FILE"
    cd "$PROJECT_ROOT"
fi

# Count backed up files and calculate size
BACKED_UP_FILES=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

cat >> "$MANIFEST_FILE" << EOF

Backup Statistics:
-----------------
Files Backed Up: $BACKED_UP_FILES
Total Backup Size: $BACKUP_SIZE
Critical Files Included:
  - Source code (src/)
  - Configuration files
  - Database files (*.db*)
  - Static assets (static/)
  - Uploaded media (static/uploads/)
  - Internationalization (messages/)
  - Database migrations (drizzle/)
  - Documentation (Documentation/)

Excluded Files:
  - node_modules/
  - Build artifacts (.svelte-kit/, build/, dist/)
  - Cache files
  - Log files
  - Temporary files
  - Development server files

Restoration Instructions:
------------------------
1. Run: scripts/restore.sh
2. Select this backup: backup_$TIMESTAMP
3. The restore script will handle node_modules restoration
EOF

log_success "Backup manifest created: $MANIFEST_FILE"

# Verify backup integrity
log_info "Verifying backup integrity..."

# Check for critical directories
CRITICAL_DIRS=("src" "messages" "drizzle" "static" "Documentation")
MISSING_DIRS=()

for dir in "${CRITICAL_DIRS[@]}"; do
    if [[ -d "$PROJECT_ROOT/$dir" ]] && [[ ! -d "$BACKUP_DIR/$dir" ]]; then
        MISSING_DIRS+=("$dir")
    fi
done

if [[ ${#MISSING_DIRS[@]} -gt 0 ]]; then
    log_error "Critical directories missing from backup: ${MISSING_DIRS[*]}"
    exit 1
fi

# Check for critical files
CRITICAL_FILES=("package.json" "svelte.config.js" "tailwind.config.js" "drizzle.config.ts")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$PROJECT_ROOT/$file" ]] && [[ ! -f "$BACKUP_DIR/$file" ]]; then
        MISSING_FILES+=("$file")
    fi
done

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    log_error "Critical files missing from backup: ${MISSING_FILES[*]}"
    exit 1
fi

# Check database files
DB_FILES=$(find "$PROJECT_ROOT" -name "*.db*" -type f | wc -l | tr -d ' ')
BACKED_DB_FILES=$(find "$BACKUP_DIR" -name "*.db*" -type f | wc -l | tr -d ' ')

if [[ $DB_FILES -gt 0 ]] && [[ $BACKED_DB_FILES -eq 0 ]]; then
    log_warning "Database files found in source but not in backup (this might be intentional if excluded)"
elif [[ $DB_FILES -ne $BACKED_DB_FILES ]]; then
    log_warning "Database file count mismatch: source=$DB_FILES, backup=$BACKED_DB_FILES"
fi

log_success "Backup integrity verification passed"

# Clean up old backups
log_info "Cleaning up backups older than $DAYS_TO_KEEP days..."

if [[ -d "$BACKUP_BASE_DIR" ]]; then
    CLEANED_COUNT=0
    while IFS= read -r -d '' backup_path; do
        if [[ -d "$backup_path" ]]; then
            backup_name=$(basename "$backup_path")
            if [[ "$backup_name" =~ ^backup_[0-9]{8}_[0-9]{4}$ ]]; then
                backup_date=$(echo "$backup_name" | sed 's/backup_//')
                backup_timestamp=$(date -j -f "%Y%m%d_%H%M" "$backup_date" "+%s" 2>/dev/null || echo "0")
                current_timestamp=$(date "+%s")
                days_old=$(( (current_timestamp - backup_timestamp) / 86400 ))
                
                if [[ $days_old -gt $DAYS_TO_KEEP ]]; then
                    log_verbose "Removing old backup: $backup_name (${days_old} days old)"
                    rm -rf "$backup_path"
                    ((CLEANED_COUNT++))
                fi
            fi
        fi
    done < <(find "$BACKUP_BASE_DIR" -maxdepth 1 -type d -name "backup_*" -print0)
    
    if [[ $CLEANED_COUNT -gt 0 ]]; then
        log_success "Cleaned up $CLEANED_COUNT old backup(s)"
    else
        log_info "No old backups to clean up"
    fi
fi

# Final summary
echo ""
log_success "=== BACKUP COMPLETED SUCCESSFULLY ==="
log_info "Backup Details:"
log_info "  Location: $BACKUP_DIR"
log_info "  Size: $BACKUP_SIZE"
log_info "  Files: $BACKED_UP_FILES"
log_info "  Timestamp: $TIMESTAMP"
echo ""
log_info "To restore this backup, run: scripts/restore.sh"
log_info "To view backup manifest: cat '$MANIFEST_FILE'"
echo ""

# Save backup info for easy access
echo "$TIMESTAMP|$BACKUP_SIZE|$BACKED_UP_FILES|$(date)" >> "$BACKUP_BASE_DIR/backup_history.log"

exit 0