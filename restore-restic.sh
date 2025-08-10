#!/usr/bin/env bash

# =============================================================================
# CeLesteCMS Pro - Restic Restore Script
# =============================================================================
# Professional restore solution using Restic with interactive options and safety checks
# Handles paths with spaces correctly and provides comprehensive logging
#
# Usage: ./restore-restic.sh [OPTIONS]
# Options:
#   -s, --snapshot ID     Restore specific snapshot ID
#   -d, --destination     Restore to specific directory (default: temp dir)
#   -f, --force          Skip safety confirmations
#   -l, --list           List available snapshots and exit
#   -h, --help           Show this help message
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# =============================================================================
# CONFIGURATION
# =============================================================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_NAME="CeLesteCMS Pro"
readonly RESTIC_REPOSITORY="$HOME/CeLesteCMS-Backups/restic-repo"
readonly LOG_DIR="$HOME/CeLesteCMS-Backups/logs"
readonly LOG_FILE="$LOG_DIR/restore-$(date +%Y%m%d-%H%M%S).log"
readonly RESTIC_PASSWORD_COMMAND="security find-generic-password -a $USER -s restic-celestecms -w"
readonly DEFAULT_RESTORE_DIR="$HOME/CeLesteCMS-Backups/restore-$(date +%Y%m%d-%H%M%S)"

# Export environment variables for Restic
export RESTIC_REPOSITORY
export RESTIC_PASSWORD_COMMAND

# =============================================================================
# VARIABLES
# =============================================================================
SNAPSHOT_ID=""
RESTORE_DESTINATION=""
FORCE_MODE=false
LIST_ONLY=false

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

print_question() {
    echo -e "\033[1;35m[QUESTION]\033[0m $1"
}

# Show help message
show_help() {
    cat << EOF
CeLesteCMS Pro - Restic Restore Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -s, --snapshot ID     Restore specific snapshot ID
    -d, --destination DIR Restore to specific directory (default: temp dir)
    -f, --force          Skip safety confirmations
    -l, --list           List available snapshots and exit
    -h, --help           Show this help message

EXAMPLES:
    $0 --list                                    # List all snapshots
    $0 --snapshot a1b2c3d4                       # Restore specific snapshot to temp dir
    $0 --snapshot latest --destination ~/restore # Restore latest to specific dir
    $0 --force --snapshot latest                 # Force restore without confirmations

SAFETY:
    - By default, restores to a temporary directory to prevent data loss
    - Use --force to skip safety confirmations
    - Always verify restored data before overwriting your working directory
EOF
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

# Ask for user confirmation
ask_confirmation() {
    local message="$1"
    if [[ "$FORCE_MODE" == true ]]; then
        print_status "Force mode enabled, skipping confirmation"
        return 0
    fi
    
    print_question "$message (y/N): "
    read -r response
    case "$response" in
        [yY]|[yY][eE][sS])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# =============================================================================
# SNAPSHOT FUNCTIONS
# =============================================================================

# List all available snapshots
list_snapshots() {
    print_status "Available snapshots:"
    echo "=============================================================================="
    restic snapshots --compact | tee -a "$LOG_FILE"
    echo "=============================================================================="
    
    print_status "Recent snapshots (detailed):"
    restic snapshots --latest 5 | tee -a "$LOG_FILE"
}

# Validate snapshot ID
validate_snapshot() {
    local snapshot="$1"
    
    if [[ "$snapshot" == "latest" ]]; then
        print_status "Using latest snapshot"
        return 0
    fi
    
    print_status "Validating snapshot ID: $snapshot"
    if restic snapshots "$snapshot" &> /dev/null; then
        print_success "Snapshot ID validated"
        return 0
    else
        print_error "Invalid snapshot ID: $snapshot"
        return 1
    fi
}

# Get snapshot information
get_snapshot_info() {
    local snapshot="$1"
    print_status "Snapshot information:"
    restic snapshots "$snapshot" | tee -a "$LOG_FILE"
}

# Interactive snapshot selection
interactive_snapshot_selection() {
    print_status "Interactive snapshot selection:"
    
    # Show recent snapshots with numbers
    local snapshots_list
    snapshots_list=$(restic snapshots --compact --json | jq -r '.[] | "\(.id[:8]) \(.time) \(.tags // [] | join(","))"' | head -10)
    
    if [[ -z "$snapshots_list" ]]; then
        print_error "No snapshots found in repository"
        exit 1
    fi
    
    echo "Available snapshots (showing latest 10):"
    echo "=============================================================================="
    local counter=1
    while IFS= read -r line; do
        echo "$counter) $line"
        ((counter++))
    done <<< "$snapshots_list"
    echo "=============================================================================="
    
    print_question "Enter snapshot number (1-$((counter-1))) or snapshot ID (or 'latest' for most recent): "
    read -r selection
    
    if [[ "$selection" == "latest" ]]; then
        SNAPSHOT_ID="latest"
    elif [[ "$selection" =~ ^[0-9]+$ ]] && [[ "$selection" -ge 1 ]] && [[ "$selection" -lt "$counter" ]]; then
        # Extract snapshot ID from selected line
        local selected_line
        selected_line=$(echo "$snapshots_list" | sed -n "${selection}p")
        SNAPSHOT_ID=$(echo "$selected_line" | awk '{print $1}')
    else
        # Assume it's a direct snapshot ID
        SNAPSHOT_ID="$selection"
    fi
    
    print_status "Selected snapshot: $SNAPSHOT_ID"
}

# =============================================================================
# RESTORE FUNCTIONS
# =============================================================================

# Perform the restore
perform_restore() {
    local snapshot="$1"
    local destination="$2"
    
    print_status "Starting restore operation..."
    print_status "Snapshot: $snapshot"
    print_status "Destination: $destination"
    print_status "Time: $(date)"
    
    # Ensure destination directory exists
    ensure_directory "$destination"
    
    local start_time=$(date +%s)
    
    # Perform restore
    if restic restore "$snapshot" \
        --target "$destination" \
        --verbose 2>&1 | tee -a "$LOG_FILE"; then
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        print_success "Restore completed in ${duration} seconds"
        
        return 0
    else
        print_error "Restore failed!"
        return 1
    fi
}

# Verify restored data
verify_restore() {
    local restore_path="$1"
    
    print_status "Verifying restored data..."
    
    # Check if key files exist
    local key_files=(
        "package.json"
        "src"
        "static"
        "messages"
        "svelte.config.js"
    )
    
    local missing_files=()
    for file in "${key_files[@]}"; do
        if [[ ! -e "$restore_path/$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        print_success "All key files restored successfully"
    else
        print_warning "Some key files are missing: ${missing_files[*]}"
    fi
    
    # Show directory structure
    print_status "Restored directory structure:"
    ls -la "$restore_path" | head -20 | tee -a "$LOG_FILE"
    
    # Calculate size
    local size
    size=$(du -sh "$restore_path" 2>/dev/null | cut -f1 || echo "Unknown")
    print_status "Total restored size: $size"
}

# Generate restore summary
generate_restore_summary() {
    local snapshot="$1"
    local destination="$2"
    
    echo "==============================================================================" | tee -a "$LOG_FILE"
    echo "RESTORE SUMMARY - $(date)" | tee -a "$LOG_FILE"
    echo "==============================================================================" | tee -a "$LOG_FILE"
    echo "Snapshot: $snapshot" | tee -a "$LOG_FILE"
    echo "Restored to: $destination" | tee -a "$LOG_FILE"
    echo "==============================================================================" | tee -a "$LOG_FILE"
}

# =============================================================================
# ARGUMENT PARSING
# =============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--snapshot)
                SNAPSHOT_ID="$2"
                shift 2
                ;;
            -d|--destination)
                RESTORE_DESTINATION="$2"
                shift 2
                ;;
            -f|--force)
                FORCE_MODE=true
                shift
                ;;
            -l|--list)
                LIST_ONLY=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    echo "=============================================================================="
    echo "CeLesteCMS Pro - Restic Restore Script"
    echo "Started: $(date)"
    echo "=============================================================================="
    
    # Setup
    ensure_directory "$LOG_DIR"
    print_status "Restore log: $LOG_FILE"
    
    # Pre-flight checks
    print_status "Performing pre-flight checks..."
    check_command "restic"
    check_command "security"
    validate_repository
    
    # List only mode
    if [[ "$LIST_ONLY" == true ]]; then
        list_snapshots
        exit 0
    fi
    
    # Interactive snapshot selection if not provided
    if [[ -z "$SNAPSHOT_ID" ]]; then
        interactive_snapshot_selection
    fi
    
    # Validate snapshot
    if ! validate_snapshot "$SNAPSHOT_ID"; then
        exit 1
    fi
    
    # Show snapshot info
    get_snapshot_info "$SNAPSHOT_ID"
    
    # Set default destination if not provided
    if [[ -z "$RESTORE_DESTINATION" ]]; then
        RESTORE_DESTINATION="$DEFAULT_RESTORE_DIR"
    fi
    
    # Safety check for production directory
    if [[ "$RESTORE_DESTINATION" == "$SCRIPT_DIR" ]]; then
        print_warning "You are about to restore to the working directory!"
        if ! ask_confirmation "This will overwrite your current files. Are you sure?"; then
            print_status "Restore cancelled by user"
            exit 0
        fi
    fi
    
    # Confirm restore operation
    if ! ask_confirmation "Restore snapshot '$SNAPSHOT_ID' to '$RESTORE_DESTINATION'?"; then
        print_status "Restore cancelled by user"
        exit 0
    fi
    
    # Perform restore
    if perform_restore "$SNAPSHOT_ID" "$RESTORE_DESTINATION"; then
        verify_restore "$RESTORE_DESTINATION"
        generate_restore_summary "$SNAPSHOT_ID" "$RESTORE_DESTINATION"
        
        print_success "Restore completed successfully!"
        print_status "Restored to: $RESTORE_DESTINATION"
        print_status "Log file: $LOG_FILE"
        
        if [[ "$RESTORE_DESTINATION" != "$SCRIPT_DIR" ]]; then
            print_status "To use the restored files, you can:"
            print_status "  1. Review the files in: $RESTORE_DESTINATION"
            print_status "  2. Copy specific files back to your working directory"
            print_status "  3. Or replace your working directory entirely (be careful!)"
        fi
    else
        print_error "Restore failed!"
        exit 1
    fi
    
    echo "=============================================================================="
    echo "Restore completed: $(date)"
    echo "=============================================================================="
}

# =============================================================================
# ERROR HANDLING
# =============================================================================

# Trap errors and cleanup
trap 'print_error "Script failed at line $LINENO. Exit code: $?"' ERR

# Handle interruption
trap 'print_warning "Restore interrupted by user"; exit 130' INT TERM

# Parse arguments and run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    parse_arguments "$@"
    main
fi