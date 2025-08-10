#!/usr/bin/env bash

# =============================================================================
# CeLesteCMS Pro - Restic Backup Script
# =============================================================================
# Professional backup solution using Restic with error handling and verification
# Handles paths with spaces correctly and provides comprehensive logging
#
# Usage: ./backup-restic.sh
# Requirements: Restic installed via Homebrew, macOS Keychain password setup
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# CONFIGURATION
# =============================================================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_NAME="CeLesteCMS Pro"
readonly RESTIC_REPOSITORY="$HOME/CeLesteCMS-Backups/restic-repo"
readonly LOG_DIR="$HOME/CeLesteCMS-Backups/logs"
readonly LOG_FILE="$LOG_DIR/backup-$(date +%Y%m%d-%H%M%S).log"
readonly RESTIC_PASSWORD_COMMAND="security find-generic-password -a $USER -s restic-celestecms -w"

# Export environment variables for Restic
export RESTIC_REPOSITORY
export RESTIC_PASSWORD_COMMAND

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Print colored output
print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1" | tee -a "$LOG_FILE" >&2
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1" | tee -a "$LOG_FILE"
}

# Create directory if it doesn't exist
ensure_directory() {
    local dir="$1"
    if [[ ! -d "$dir" ]]; then
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    fi
}

# Check if command exists
check_command() {
    local cmd="$1"
    if ! command -v "$cmd" &> /dev/null; then
        print_error "Required command '$cmd' not found. Please install it first."
        exit 1
    fi
}

# Validate repository access
validate_repository() {
    print_status "Validating repository access..."
    if ! restic cat config &> /dev/null; then
        print_error "Cannot access Restic repository. Check your password and repository path."
        exit 1
    fi
    print_success "Repository access validated"
}

# Get backup size estimates
estimate_backup_size() {
    print_status "Estimating backup size..."
    
    # Use Restic's dry-run to estimate what will be backed up
    local temp_log=$(mktemp)
    if restic backup --dry-run --verbose "$SCRIPT_DIR" 2>&1 | tee "$temp_log" | tail -n 20; then
        local file_count=$(grep -c "^would add" "$temp_log" 2>/dev/null || echo "0")
        print_status "Estimated files to backup: $file_count"
    else
        print_warning "Could not estimate backup size"
    fi
    rm -f "$temp_log"
}

# =============================================================================
# BACKUP FUNCTIONS
# =============================================================================

# Perform the backup
perform_backup() {
    print_status "Starting backup of $PROJECT_NAME..."
    print_status "Source: $SCRIPT_DIR"
    print_status "Repository: $RESTIC_REPOSITORY"
    print_status "Time: $(date)"
    
    local start_time=$(date +%s)
    local backup_tag="auto-$(date +%Y%m%d-%H%M%S)"
    
    # Perform backup with progress and tagging
    if restic backup \
        --verbose \
        --tag "$backup_tag" \
        --tag "automated" \
        --exclude-file="$SCRIPT_DIR/.resticignore" \
        "$SCRIPT_DIR" 2>&1 | tee -a "$LOG_FILE"; then
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        print_success "Backup completed in ${duration} seconds with tag: $backup_tag"
        
        # Return the tag for verification
        echo "$backup_tag"
    else
        print_error "Backup failed!"
        exit 1
    fi
}

# Verify the backup
verify_backup() {
    local backup_tag="$1"
    print_status "Verifying backup integrity..."
    
    if restic check --read-data-subset=5% 2>&1 | tee -a "$LOG_FILE"; then
        print_success "Backup integrity verified (5% data sample checked)"
    else
        print_error "Backup verification failed!"
        exit 1
    fi
    
    # Show recent snapshots
    print_status "Recent snapshots:"
    restic snapshots --latest 3 --compact | tee -a "$LOG_FILE"
}

# Generate backup summary
generate_summary() {
    local backup_tag="$1"
    print_status "Generating backup summary..."
    
    echo "==============================================================================" | tee -a "$LOG_FILE"
    echo "BACKUP SUMMARY - $(date)" | tee -a "$LOG_FILE"
    echo "==============================================================================" | tee -a "$LOG_FILE"
    
    # Repository statistics
    print_status "Repository statistics:"
    restic stats --mode raw-data 2>&1 | tee -a "$LOG_FILE"
    
    echo "==============================================================================" | tee -a "$LOG_FILE"
}

# Cleanup old backups based on policy
cleanup_old_backups() {
    print_status "Cleaning up old backups (retention policy)..."
    
    # Keep: 7 daily, 4 weekly, 6 monthly backups
    if restic forget \
        --keep-daily 7 \
        --keep-weekly 4 \
        --keep-monthly 6 \
        --tag automated \
        --prune \
        --verbose 2>&1 | tee -a "$LOG_FILE"; then
        
        print_success "Old backups cleaned up successfully"
    else
        print_warning "Cleanup encountered issues, but backup is still valid"
    fi
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    echo "=============================================================================="
    echo "CeLesteCMS Pro - Restic Backup Script"
    echo "Started: $(date)"
    echo "=============================================================================="
    
    # Setup
    ensure_directory "$LOG_DIR"
    print_status "Backup log: $LOG_FILE"
    
    # Pre-flight checks
    print_status "Performing pre-flight checks..."
    check_command "restic"
    check_command "security"
    validate_repository
    
    # Backup process
    estimate_backup_size
    local backup_tag
    backup_tag=$(perform_backup)
    verify_backup "$backup_tag"
    cleanup_old_backups
    generate_summary "$backup_tag"
    
    # Success
    print_success "Backup completed successfully!"
    print_status "Backup tag: $backup_tag"
    print_status "Log file: $LOG_FILE"
    
    echo "=============================================================================="
    echo "Backup completed: $(date)"
    echo "=============================================================================="
}

# =============================================================================
# ERROR HANDLING
# =============================================================================

# Trap errors and cleanup
trap 'print_error "Script failed at line $LINENO. Exit code: $?"' ERR

# Handle interruption
trap 'print_warning "Backup interrupted by user"; exit 130' INT TERM

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi