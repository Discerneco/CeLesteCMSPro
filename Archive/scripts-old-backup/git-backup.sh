#!/bin/bash
# CeLesteCMS Pro - Git Backup and Safety Script
# Pushes branches to remote, creates backup tags, and generates git bundles

set -e  # Exit on any error

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_BASE_DIR="$PROJECT_ROOT/../CeLesteCMS-Git-Backups"
TIMESTAMP=$(date +%Y%m%d_%H%M)
BUNDLE_FILE="$BACKUP_BASE_DIR/celestecms-bundle-$TIMESTAMP.git"
FORCE_PUSH=false
SKIP_REMOTE=false
QUIET=false
VERBOSE=false
CREATE_TAG=false
TAG_MESSAGE=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line options
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE_PUSH=true
            shift
            ;;
        --skip-remote)
            SKIP_REMOTE=true
            shift
            ;;
        -t|--tag)
            CREATE_TAG=true
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
        -h|--help)
            echo "CeLesteCMS Pro Git Backup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -f, --force            Force push to remote (use with caution)"
            echo "  --skip-remote          Skip remote operations, only create local bundle"
            echo "  -t, --tag MESSAGE      Create backup tag with message"
            echo "  -q, --quiet            Suppress non-error output"
            echo "  -v, --verbose          Show detailed progress"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                     # Standard git backup with remote push"
            echo "  $0 --skip-remote       # Create bundle backup only"
            echo "  $0 -t \"Pre-deployment backup\"  # Create tagged backup"
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

# Check if we're in a git repository
if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
    log_error "Not in a git repository: $PROJECT_ROOT"
    exit 1
fi

cd "$PROJECT_ROOT"

# Create backup directory
mkdir -p "$BACKUP_BASE_DIR"

log_info "Starting Git backup for CeLesteCMS Pro"
log_info "Repository: $PROJECT_ROOT"
log_info "Backup location: $BACKUP_BASE_DIR"

# Get current repository status
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
REPO_STATUS=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
TOTAL_BRANCHES=$(git branch -a | grep -v remotes | wc -l | tr -d ' ')
REMOTE_BRANCHES=$(git branch -r | wc -l | tr -d ' ')

log_info "Repository Status:"
log_info "  Current branch: $CURRENT_BRANCH"
log_info "  Modified files: $REPO_STATUS"
log_info "  Local branches: $TOTAL_BRANCHES"
log_info "  Remote branches: $REMOTE_BRANCHES"

# Warn if there are uncommitted changes
if [[ $REPO_STATUS -gt 0 ]]; then
    log_warning "You have $REPO_STATUS uncommitted changes"
    git status --porcelain | head -10 | while read -r line; do
        log_warning "  $line"
    done
    
    if [[ $REPO_STATUS -gt 10 ]]; then
        log_warning "  ... and $((REPO_STATUS - 10)) more files"
    fi
    
    echo ""
    if [[ "$FORCE_PUSH" != true ]]; then
        read -p "Continue with backup despite uncommitted changes? (y/N): " confirm
        if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
            log_info "Git backup cancelled by user"
            exit 0
        fi
    fi
fi

# Create backup tag if requested
if [[ "$CREATE_TAG" == true ]]; then
    TAG_NAME="backup-$TIMESTAMP"
    log_info "Creating backup tag: $TAG_NAME"
    
    if [[ -n "$TAG_MESSAGE" ]]; then
        git tag -a "$TAG_NAME" -m "$TAG_MESSAGE"
    else
        git tag -a "$TAG_NAME" -m "Automatic backup tag created on $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    log_success "Backup tag created: $TAG_NAME"
fi

# Remote operations
if [[ "$SKIP_REMOTE" != true ]]; then
    # Check for remote
    REMOTE_NAME=$(git remote | head -1)
    
    if [[ -n "$REMOTE_NAME" ]]; then
        log_info "Found remote: $REMOTE_NAME"
        
        # Fetch latest from remote
        log_info "Fetching latest from remote..."
        if git fetch "$REMOTE_NAME" --all --prune; then
            log_success "Fetched latest changes from remote"
        else
            log_warning "Failed to fetch from remote, continuing..."
        fi
        
        # Get all local branches
        LOCAL_BRANCHES=()
        while IFS= read -r branch; do
            branch=$(echo "$branch" | sed 's/^[* ] *//')
            if [[ "$branch" != *"detached"* ]]; then
                LOCAL_BRANCHES+=("$branch")
            fi
        done < <(git branch)
        
        log_info "Found ${#LOCAL_BRANCHES[@]} local branches to backup"
        
        # Push all local branches
        PUSHED_BRANCHES=0
        FAILED_BRANCHES=0
        
        for branch in "${LOCAL_BRANCHES[@]}"; do
            log_verbose "Processing branch: $branch"
            
            # Check if branch exists on remote
            if git ls-remote --exit-code --heads "$REMOTE_NAME" "$branch" >/dev/null 2>&1; then
                # Branch exists on remote, check if we need to push
                LOCAL_COMMIT=$(git rev-parse "$branch" 2>/dev/null || echo "")
                REMOTE_COMMIT=$(git rev-parse "$REMOTE_NAME/$branch" 2>/dev/null || echo "")
                
                if [[ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]]; then
                    log_info "Pushing updates for branch: $branch"
                    if [[ "$FORCE_PUSH" == true ]]; then
                        if git push --force-with-lease "$REMOTE_NAME" "$branch"; then
                            ((PUSHED_BRANCHES++))
                            log_success "Force-pushed branch: $branch"
                        else
                            ((FAILED_BRANCHES++))
                            log_error "Failed to force-push branch: $branch"
                        fi
                    else
                        if git push "$REMOTE_NAME" "$branch"; then
                            ((PUSHED_BRANCHES++))
                            log_success "Pushed branch: $branch"
                        else
                            ((FAILED_BRANCHES++))
                            log_warning "Failed to push branch: $branch (may need --force option)"
                        fi
                    fi
                else
                    log_verbose "Branch $branch is up to date"
                fi
            else
                # New branch, push it
                log_info "Pushing new branch: $branch"
                if git push -u "$REMOTE_NAME" "$branch"; then
                    ((PUSHED_BRANCHES++))
                    log_success "Pushed new branch: $branch"
                else
                    ((FAILED_BRANCHES++))
                    log_error "Failed to push new branch: $branch"
                fi
            fi
        done
        
        # Push tags
        if [[ "$CREATE_TAG" == true ]]; then
            log_info "Pushing backup tag to remote..."
            if git push "$REMOTE_NAME" "$TAG_NAME"; then
                log_success "Pushed backup tag to remote"
            else
                log_warning "Failed to push backup tag to remote"
            fi
        fi
        
        log_info "Remote backup summary:"
        log_info "  Branches pushed: $PUSHED_BRANCHES"
        if [[ $FAILED_BRANCHES -gt 0 ]]; then
            log_warning "  Failed branches: $FAILED_BRANCHES"
        fi
        
    else
        log_warning "No remote configured, skipping remote backup"
        SKIP_REMOTE=true
    fi
fi

# Create git bundle backup
log_info "Creating git bundle backup..."

# Bundle all branches and tags
if git bundle create "$BUNDLE_FILE" --all; then
    BUNDLE_SIZE=$(du -sh "$BUNDLE_FILE" | cut -f1)
    log_success "Git bundle created: $BUNDLE_FILE ($BUNDLE_SIZE)"
else
    log_error "Failed to create git bundle"
    exit 1
fi

# Verify bundle integrity
log_info "Verifying bundle integrity..."
if git bundle verify "$BUNDLE_FILE" >/dev/null 2>&1; then
    log_success "Bundle integrity verified"
else
    log_error "Bundle verification failed"
    exit 1
fi

# Create bundle manifest
MANIFEST_FILE="$BACKUP_BASE_DIR/bundle-manifest-$TIMESTAMP.txt"
cat > "$MANIFEST_FILE" << EOF
CeLesteCMS Pro Git Bundle Manifest
=================================
Bundle Date: $(date '+%Y-%m-%d %H:%M:%S %Z')
Bundle File: $BUNDLE_FILE
Bundle Size: $BUNDLE_SIZE
Repository: $PROJECT_ROOT
Created By: $(whoami)

Repository Information:
----------------------
Current Branch: $CURRENT_BRANCH
Uncommitted Changes: $REPO_STATUS files
Total Commits: $(git rev-list --all --count 2>/dev/null || echo "Unknown")

Local Branches:
--------------
EOF

git branch | sed 's/^/  /' >> "$MANIFEST_FILE"

cat >> "$MANIFEST_FILE" << EOF

Remote Tracking Branches:
------------------------
EOF

git branch -r | sed 's/^/  /' >> "$MANIFEST_FILE" 2>/dev/null || echo "  No remote branches" >> "$MANIFEST_FILE"

cat >> "$MANIFEST_FILE" << EOF

Tags:
----
EOF

git tag -l | sed 's/^/  /' >> "$MANIFEST_FILE" || echo "  No tags" >> "$MANIFEST_FILE"

if [[ "$CREATE_TAG" == true ]]; then
    cat >> "$MANIFEST_FILE" << EOF

Backup Tag Created:
------------------
  $TAG_NAME - $TAG_MESSAGE
EOF
fi

cat >> "$MANIFEST_FILE" << EOF

Recent Commits (last 10):
------------------------
EOF

git log --oneline -10 | sed 's/^/  /' >> "$MANIFEST_FILE" 2>/dev/null || echo "  No commits found" >> "$MANIFEST_FILE"

cat >> "$MANIFEST_FILE" << EOF

Bundle Restoration Instructions:
-------------------------------
1. Clone from bundle:
   git clone $BUNDLE_FILE restored-project

2. Add original remote (if needed):
   cd restored-project
   git remote add origin <remote-url>

3. Verify all branches:
   git branch -a

4. Push to new remote (if needed):
   git push --all origin
   git push --tags origin

Bundle Verification:
-------------------
To verify this bundle anytime:
  git bundle verify $BUNDLE_FILE

This bundle contains all branches, tags, and commit history
up to the creation date listed above.
EOF

log_success "Bundle manifest created: $MANIFEST_FILE"

# Clean up old bundles (keep last 10)
log_info "Cleaning up old git bundles..."
OLD_BUNDLES=$(find "$BACKUP_BASE_DIR" -name "celestecms-bundle-*.git" | sort -r | tail -n +11)
OLD_MANIFESTS=$(find "$BACKUP_BASE_DIR" -name "bundle-manifest-*.txt" | sort -r | tail -n +11)

CLEANED_COUNT=0
if [[ -n "$OLD_BUNDLES" ]]; then
    echo "$OLD_BUNDLES" | while read -r old_bundle; do
        if [[ -f "$old_bundle" ]]; then
            rm -f "$old_bundle"
            ((CLEANED_COUNT++))
            log_verbose "Removed old bundle: $(basename "$old_bundle")"
        fi
    done
fi

if [[ -n "$OLD_MANIFESTS" ]]; then
    echo "$OLD_MANIFESTS" | while read -r old_manifest; do
        if [[ -f "$old_manifest" ]]; then
            rm -f "$old_manifest"
            log_verbose "Removed old manifest: $(basename "$old_manifest")"
        fi
    done
fi

if [[ $CLEANED_COUNT -gt 0 ]]; then
    log_success "Cleaned up old git backups"
fi

# Generate remote sync status report
SYNC_REPORT="$BACKUP_BASE_DIR/sync-status-$TIMESTAMP.txt"
cat > "$SYNC_REPORT" << EOF
Git Remote Sync Status Report
============================
Report Date: $(date '+%Y-%m-%d %H:%M:%S %Z')
Repository: $PROJECT_ROOT

Summary:
-------
Remote Operations: $([ "$SKIP_REMOTE" == true ] && echo "Skipped" || echo "Executed")
Bundle Created: Yes ($BUNDLE_SIZE)
Backup Tag: $([ "$CREATE_TAG" == true ] && echo "$TAG_NAME" || echo "None")
Uncommitted Changes: $REPO_STATUS files

EOF

if [[ "$SKIP_REMOTE" != true ]] && [[ -n "$REMOTE_NAME" ]]; then
    cat >> "$SYNC_REPORT" << EOF
Remote Sync Details:
-------------------
Remote Name: $REMOTE_NAME
Remote URL: $(git remote get-url "$REMOTE_NAME" 2>/dev/null || echo "Unknown")
Branches Pushed: ${PUSHED_BRANCHES:-0}
Failed Pushes: ${FAILED_BRANCHES:-0}

Branch Status:
EOF

    for branch in "${LOCAL_BRANCHES[@]:-}"; do
        if git ls-remote --exit-code --heads "$REMOTE_NAME" "$branch" >/dev/null 2>&1; then
            LOCAL_COMMIT=$(git rev-parse "$branch" 2>/dev/null || echo "")
            REMOTE_COMMIT=$(git rev-parse "$REMOTE_NAME/$branch" 2>/dev/null || echo "")
            
            if [[ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]]; then
                echo "  $branch: ✓ In sync" >> "$SYNC_REPORT"
            else
                echo "  $branch: ⚠ Out of sync" >> "$SYNC_REPORT"
            fi
        else
            echo "  $branch: ⚠ Not on remote" >> "$SYNC_REPORT"
        fi
    done
fi

log_success "Sync status report created: $SYNC_REPORT"

# Final summary
echo ""
log_success "=== GIT BACKUP COMPLETED ==="
log_info "Backup Details:"
log_info "  Bundle file: $BUNDLE_FILE"
log_info "  Bundle size: $BUNDLE_SIZE"
log_info "  Manifest: $MANIFEST_FILE"
if [[ "$CREATE_TAG" == true ]]; then
    log_info "  Backup tag: $TAG_NAME"
fi
if [[ "$SKIP_REMOTE" != true ]] && [[ -n "$REMOTE_NAME" ]]; then
    log_info "  Remote sync: ${PUSHED_BRANCHES:-0} branches pushed"
    if [[ ${FAILED_BRANCHES:-0} -gt 0 ]]; then
        log_warning "  Failed pushes: $FAILED_BRANCHES"
    fi
fi
echo ""
log_info "To restore from bundle:"
log_info "  git clone $BUNDLE_FILE restored-project"
echo ""

exit 0