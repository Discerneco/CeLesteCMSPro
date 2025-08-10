#!/bin/bash
# CeLesteCMS Pro - Complete Backup Utility
# Runs both file system and git backups with a single command

set -e  # Exit on any error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M)
TAG_MESSAGE=""
QUIET=false
VERBOSE=false
SKIP_GIT=false
SKIP_FILES=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line options
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG_MESSAGE="$2"
            shift 2
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --skip-git)
            SKIP_GIT=true
            shift
            ;;
        --skip-files)
            SKIP_FILES=true
            shift
            ;;
        -h|--help)
            echo "CeLesteCMS Pro Complete Backup Utility"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -t, --tag MESSAGE    Create backup tag for git backup"
            echo "  -q, --quiet          Suppress non-error output"
            echo "  -v, --verbose        Show detailed progress"
            echo "  --skip-git           Skip git backup, only backup files"
            echo "  --skip-files         Skip file backup, only backup git"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                   # Complete backup (files + git)"
            echo "  $0 -t \"v1.2 release\"  # Tagged backup"
            echo "  $0 --skip-git        # Files only"
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

# Change to project directory
cd "$PROJECT_ROOT"

# Prepare script options
SCRIPT_OPTS=""
if [[ "$QUIET" == true ]]; then
    SCRIPT_OPTS="$SCRIPT_OPTS --quiet"
elif [[ "$VERBOSE" == true ]]; then
    SCRIPT_OPTS="$SCRIPT_OPTS --verbose"
fi

# Start complete backup process
if [[ "$QUIET" != true ]]; then
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE} CeLesteCMS Pro Complete Backup${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
fi

log_info "Starting complete backup process at $(date)"
log_info "Backup identifier: $TIMESTAMP"

# File System Backup
if [[ "$SKIP_FILES" != true ]]; then
    log_info "Phase 1: File System Backup"
    echo "----------------------------------------"
    
    if ./scripts/backup.sh $SCRIPT_OPTS; then
        log_success "File system backup completed"
    else
        log_error "File system backup failed"
        exit 1
    fi
    
    echo ""
fi

# Git Backup
if [[ "$SKIP_GIT" != true ]]; then
    log_info "Phase 2: Git Repository Backup"
    echo "----------------------------------------"
    
    GIT_OPTS="$SCRIPT_OPTS"
    if [[ -n "$TAG_MESSAGE" ]]; then
        GIT_OPTS="$GIT_OPTS --tag \"$TAG_MESSAGE\""
    fi
    
    if eval "./scripts/git-backup.sh $GIT_OPTS"; then
        log_success "Git backup completed"
    else
        log_error "Git backup failed"
        exit 1
    fi
    
    echo ""
fi

# Final summary
if [[ "$QUIET" != true ]]; then
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN} COMPLETE BACKUP FINISHED${NC}" 
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    
    log_info "Backup Summary for $TIMESTAMP:"
    
    if [[ "$SKIP_FILES" != true ]]; then
        # Try to get file backup info
        BACKUP_DIR="../CeLesteCMS-Backups"
        LATEST_BACKUP=$(find "$BACKUP_DIR" -maxdepth 1 -name "backup_$TIMESTAMP*" 2>/dev/null | head -1)
        if [[ -n "$LATEST_BACKUP" ]]; then
            BACKUP_SIZE=$(du -sh "$LATEST_BACKUP" 2>/dev/null | cut -f1 || echo "Unknown")
            log_info "  File Backup: $BACKUP_SIZE ($(basename "$LATEST_BACKUP"))"
        else
            log_info "  File Backup: Completed"
        fi
    fi
    
    if [[ "$SKIP_GIT" != true ]]; then
        # Try to get git backup info
        GIT_BACKUP_DIR="../CeLesteCMS-Git-Backups"
        LATEST_BUNDLE=$(find "$GIT_BACKUP_DIR" -name "*bundle-$TIMESTAMP*.git" 2>/dev/null | head -1)
        if [[ -n "$LATEST_BUNDLE" ]]; then
            BUNDLE_SIZE=$(du -sh "$LATEST_BUNDLE" 2>/dev/null | cut -f1 || echo "Unknown")
            log_info "  Git Bundle: $BUNDLE_SIZE ($(basename "$LATEST_BUNDLE"))"
        else
            log_info "  Git Backup: Completed"
        fi
        
        if [[ -n "$TAG_MESSAGE" ]]; then
            log_info "  Backup Tag: backup-$TIMESTAMP (\"$TAG_MESSAGE\")"
        fi
    fi
    
    echo ""
    log_info "To restore from this backup:"
    log_info "  ./scripts/restore.sh --backup backup_$TIMESTAMP"
    echo ""
fi

exit 0