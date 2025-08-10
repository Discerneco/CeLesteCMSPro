#!/bin/bash
# CeLesteCMS Pro - Backup Restoration Script
# Restores selected backup and rebuilds development environment

set -e  # Exit on any error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_BASE_DIR="$PROJECT_ROOT/../CeLesteCMS-Backups"
RESTORE_TARGET=""
BACKUP_TO_RESTORE=""
FORCE_RESTORE=false
SKIP_DEPS=false
QUIET=false
VERBOSE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line options
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--target)
            RESTORE_TARGET="$2"
            shift 2
            ;;
        -b|--backup)
            BACKUP_TO_RESTORE="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_RESTORE=true
            shift
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            echo "CeLesteCMS Pro Restore Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -t, --target PATH     Restore to specific directory (default: current project)"
            echo "  -b, --backup NAME     Restore specific backup (e.g., backup_20250809_1400)"
            echo "  -f, --force           Skip confirmation prompts"
            echo "  --skip-deps           Skip npm/pnpm install after restore"
            echo "  -q, --quiet           Suppress non-error output"
            echo "  -v, --verbose         Show detailed progress"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Interactive backup selection"
            echo "  $0 -b backup_20250809_1400  # Restore specific backup"
            echo "  $0 -t /path/to/new/project   # Restore to different location"
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

# Set default restore target
if [[ -z "$RESTORE_TARGET" ]]; then
    RESTORE_TARGET="$PROJECT_ROOT"
fi

# Check if backup directory exists
if [[ ! -d "$BACKUP_BASE_DIR" ]]; then
    log_error "Backup directory not found: $BACKUP_BASE_DIR"
    log_error "Run backup.sh first to create backups"
    exit 1
fi

# Function to list available backups
list_backups() {
    echo -e "\n${BLUE}Available Backups:${NC}"
    echo "=================="
    
    local backups=()
    local count=0
    
    while IFS= read -r -d '' backup_path; do
        if [[ -d "$backup_path" ]]; then
            backup_name=$(basename "$backup_path")
            if [[ "$backup_name" =~ ^backup_[0-9]{8}_[0-9]{4}$ ]]; then
                ((count++))
                backups+=("$backup_name")
                
                # Extract date and time
                date_time=$(echo "$backup_name" | sed 's/backup_//' | sed 's/_/ /')
                formatted_date=$(date -j -f "%Y%m%d %H%M" "$date_time" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "$date_time")
                
                # Get size
                size=$(du -sh "$backup_path" 2>/dev/null | cut -f1 || echo "Unknown")
                
                # Check for manifest
                manifest_info=""
                if [[ -f "$backup_path/backup_manifest.txt" ]]; then
                    files_count=$(grep "Files Backed Up:" "$backup_path/backup_manifest.txt" 2>/dev/null | cut -d: -f2 | tr -d ' ' || echo "Unknown")
                    if [[ "$files_count" != "Unknown" ]]; then
                        manifest_info=" ($files_count files)"
                    fi
                fi
                
                printf "%2d. %s - %s - %s%s\n" "$count" "$backup_name" "$formatted_date" "$size" "$manifest_info"
            fi
        fi
    done < <(find "$BACKUP_BASE_DIR" -maxdepth 1 -type d -name "backup_*" -print0 2>/dev/null | sort -z -r)
    
    if [[ $count -eq 0 ]]; then
        echo "No backups found in $BACKUP_BASE_DIR"
        return 1
    fi
    
    echo "${backups[@]}"
}

# Function to select backup interactively
select_backup() {
    local available_backups
    if ! available_backups=$(list_backups); then
        return 1
    fi
    
    # Convert to array (last line of list_backups output)
    local backups_array=($available_backups)
    local backup_count=${#backups_array[@]}
    
    echo ""
    read -p "Select backup number (1-$backup_count) or press Enter to cancel: " selection
    
    if [[ -z "$selection" ]]; then
        log_info "Restore cancelled by user"
        exit 0
    fi
    
    if ! [[ "$selection" =~ ^[0-9]+$ ]] || [[ "$selection" -lt 1 ]] || [[ "$selection" -gt "$backup_count" ]]; then
        log_error "Invalid selection: $selection"
        exit 1
    fi
    
    # Arrays are 0-indexed but user input is 1-indexed
    BACKUP_TO_RESTORE="${backups_array[$((selection-1))]}"
}

# If no backup specified, show selection
if [[ -z "$BACKUP_TO_RESTORE" ]]; then
    if ! select_backup; then
        exit 1
    fi
fi

# Validate backup exists
BACKUP_SOURCE="$BACKUP_BASE_DIR/$BACKUP_TO_RESTORE"
if [[ ! -d "$BACKUP_SOURCE" ]]; then
    log_error "Backup not found: $BACKUP_SOURCE"
    exit 1
fi

# Show backup information
if [[ -f "$BACKUP_SOURCE/backup_manifest.txt" ]]; then
    log_info "Backup Information:"
    echo "==================="
    head -20 "$BACKUP_SOURCE/backup_manifest.txt" | tail -n +4
    echo ""
fi

# Confirm restore operation
if [[ "$FORCE_RESTORE" != true ]]; then
    echo -e "${YELLOW}WARNING:${NC} This will overwrite files in: $RESTORE_TARGET"
    if [[ "$RESTORE_TARGET" == "$PROJECT_ROOT" ]]; then
        echo -e "${YELLOW}WARNING:${NC} You are restoring to the current project directory"
    fi
    echo ""
    read -p "Are you sure you want to proceed? (y/N): " confirm
    
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
        log_info "Restore cancelled by user"
        exit 0
    fi
fi

# Create target directory if it doesn't exist
mkdir -p "$RESTORE_TARGET"

# Check if target directory is empty or contains a project
if [[ "$RESTORE_TARGET" != "$PROJECT_ROOT" ]]; then
    if [[ -f "$RESTORE_TARGET/package.json" ]] && [[ "$FORCE_RESTORE" != true ]]; then
        log_warning "Target directory contains an existing project"
        read -p "Continue anyway? (y/N): " confirm
        if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
            log_info "Restore cancelled by user"
            exit 0
        fi
    fi
fi

log_info "Starting restore process..."
log_info "Source: $BACKUP_SOURCE"
log_info "Target: $RESTORE_TARGET"

# Prepare rsync options
RSYNC_OPTS="-a --delete"

if [[ "$VERBOSE" == true ]]; then
    RSYNC_OPTS="$RSYNC_OPTS --progress --stats"
elif [[ "$QUIET" != true ]]; then
    RSYNC_OPTS="$RSYNC_OPTS --info=progress2"
fi

# Perform the restore
log_info "Restoring files..."
if rsync $RSYNC_OPTS "$BACKUP_SOURCE/" "$RESTORE_TARGET/"; then
    log_success "Files restored successfully"
else
    log_error "Restore failed during file synchronization"
    exit 1
fi

# Remove the backup manifest from restored files (it's not part of the original project)
if [[ -f "$RESTORE_TARGET/backup_manifest.txt" ]]; then
    rm -f "$RESTORE_TARGET/backup_manifest.txt"
    log_verbose "Removed backup manifest from restored project"
fi

# Change to target directory for remaining operations
cd "$RESTORE_TARGET"

# Handle database files
DB_FILES=$(find . -name "*.db*" -type f 2>/dev/null | head -5)
if [[ -n "$DB_FILES" ]]; then
    log_info "Found database files in backup:"
    echo "$DB_FILES" | while read -r db_file; do
        log_info "  $db_file"
    done
    
    if [[ -f "local.db" ]]; then
        # Create a backup of the restored database
        cp "local.db" "local.db.restored-$(date +%Y%m%d_%H%M)"
        log_success "Created backup copy of restored database"
    fi
fi

# Install dependencies if needed
if [[ "$SKIP_DEPS" != true ]]; then
    if [[ -f "package.json" ]]; then
        log_info "Installing dependencies..."
        
        # Detect package manager
        if [[ -f "pnpm-lock.yaml" ]]; then
            PACKAGE_MANAGER="pnpm"
        elif [[ -f "yarn.lock" ]]; then
            PACKAGE_MANAGER="yarn"
        else
            PACKAGE_MANAGER="npm"
        fi
        
        log_info "Using package manager: $PACKAGE_MANAGER"
        
        # Install dependencies
        case "$PACKAGE_MANAGER" in
            pnpm)
                if command -v pnpm >/dev/null 2>&1; then
                    if [[ "$QUIET" == true ]]; then
                        pnpm install --silent
                    else
                        pnpm install
                    fi
                else
                    log_error "pnpm not found. Please install pnpm or run with --skip-deps"
                    exit 1
                fi
                ;;
            yarn)
                if command -v yarn >/dev/null 2>&1; then
                    if [[ "$QUIET" == true ]]; then
                        yarn install --silent
                    else
                        yarn install
                    fi
                else
                    log_error "yarn not found. Please install yarn or run with --skip-deps"
                    exit 1
                fi
                ;;
            npm)
                if [[ "$QUIET" == true ]]; then
                    npm install --silent
                else
                    npm install
                fi
                ;;
        esac
        
        log_success "Dependencies installed successfully"
    else
        log_warning "No package.json found in restored backup"
    fi
else
    log_info "Skipping dependency installation (--skip-deps specified)"
fi

# Verify restoration
log_info "Verifying restoration..."

# Check critical files exist
CRITICAL_FILES=("package.json" "svelte.config.js")
MISSING_FILES=()

for file in "${CRITICAL_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        MISSING_FILES+=("$file")
    fi
done

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
    log_error "Critical files missing after restore: ${MISSING_FILES[*]}"
    exit 1
fi

# Check critical directories exist
CRITICAL_DIRS=("src")
MISSING_DIRS=()

for dir in "${CRITICAL_DIRS[@]}"; do
    if [[ ! -d "$dir" ]]; then
        MISSING_DIRS+=("$dir")
    fi
done

if [[ ${#MISSING_DIRS[@]} -gt 0 ]]; then
    log_error "Critical directories missing after restore: ${MISSING_DIRS[*]}"
    exit 1
fi

# Generate restoration report
RESTORE_REPORT="restoration_report_$(date +%Y%m%d_%H%M).txt"
cat > "$RESTORE_REPORT" << EOF
CeLesteCMS Pro Restoration Report
================================
Restoration Date: $(date '+%Y-%m-%d %H:%M:%S %Z')
Source Backup: $BACKUP_TO_RESTORE
Target Directory: $RESTORE_TARGET
Restored By: $(whoami)
Package Manager: ${PACKAGE_MANAGER:-"Not detected"}

Restoration Details:
-------------------
EOF

# Count restored files
RESTORED_FILES=$(find . -type f | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh . | cut -f1)

cat >> "$RESTORE_REPORT" << EOF
Files Restored: $RESTORED_FILES
Total Size: $TOTAL_SIZE
Dependencies: $([ "$SKIP_DEPS" == true ] && echo "Skipped" || echo "Installed")

Critical Components Verified:
----------------------------
✓ package.json found
✓ src/ directory exists
✓ svelte.config.js found
$([ -f "tailwind.config.js" ] && echo "✓ tailwind.config.js found")
$([ -f "drizzle.config.ts" ] && echo "✓ drizzle.config.ts found")
$([ -d "messages" ] && echo "✓ messages/ directory exists")
$([ -d "static" ] && echo "✓ static/ directory exists")

Database Files:
--------------
$(find . -name "*.db*" -type f | sed 's/^/✓ /' || echo "No database files found")

Next Steps:
----------
1. Run 'pnpm dev' (or npm/yarn dev) to start development server
2. Verify application functionality
3. Check database connectivity if applicable
4. Update environment variables if needed

For issues, check:
- Node.js and package manager versions
- Environment variables (.env files)
- Database file permissions
- Port availability (usually 5173 for Vite)
EOF

log_success "Restoration report created: $RESTORE_REPORT"

# Final summary
echo ""
log_success "=== RESTORATION COMPLETED SUCCESSFULLY ==="
log_info "Restoration Details:"
log_info "  Source: $BACKUP_TO_RESTORE"
log_info "  Target: $RESTORE_TARGET"
log_info "  Files: $RESTORED_FILES"
log_info "  Size: $TOTAL_SIZE"
if [[ "$SKIP_DEPS" != true ]]; then
    log_info "  Dependencies: Installed using $PACKAGE_MANAGER"
else
    log_info "  Dependencies: Skipped"
fi
echo ""
log_info "To start development:"
log_info "  cd '$RESTORE_TARGET'"
if [[ "$SKIP_DEPS" == true ]]; then
    log_info "  $PACKAGE_MANAGER install  # Install dependencies first"
fi
log_info "  pnpm dev  # Start development server"
echo ""
log_info "Report saved: $RESTORE_REPORT"

exit 0