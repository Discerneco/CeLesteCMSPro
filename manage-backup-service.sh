#!/usr/bin/env bash

# =============================================================================
# CeLesteCMS Pro - Backup Service Management Script
# =============================================================================
# Helper script to manage the launchd backup service
#
# Usage: ./manage-backup-service.sh [install|uninstall|start|stop|status|logs]
# =============================================================================

set -euo pipefail

# =============================================================================
# CONFIGURATION
# =============================================================================
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SERVICE_NAME="com.celestecms.backup"
readonly PLIST_SOURCE="$SCRIPT_DIR/$SERVICE_NAME.plist"
readonly PLIST_TARGET="$HOME/Library/LaunchAgents/$SERVICE_NAME.plist"
readonly LOG_DIR="$HOME/CeLesteCMS-Backups/logs"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

show_help() {
    cat << EOF
CeLesteCMS Pro - Backup Service Management

USAGE:
    $0 [COMMAND]

COMMANDS:
    install    Install and load the backup service
    uninstall  Unload and remove the backup service  
    start      Start the backup service
    stop       Stop the backup service
    status     Show service status
    logs       Show recent service logs
    test       Run a test backup manually
    help       Show this help message

EXAMPLES:
    $0 install     # Install daily backup service
    $0 status      # Check if service is running
    $0 logs        # View recent backup logs
    $0 test        # Run backup manually for testing

The service runs daily at 2:00 AM and logs to:
  - Output: $LOG_DIR/launchd-backup.log
  - Errors:  $LOG_DIR/launchd-backup-error.log
EOF
}

ensure_log_directory() {
    if [[ ! -d "$LOG_DIR" ]]; then
        mkdir -p "$LOG_DIR"
        print_status "Created log directory: $LOG_DIR"
    fi
}

# =============================================================================
# SERVICE MANAGEMENT FUNCTIONS
# =============================================================================

install_service() {
    print_status "Installing backup service..."
    
    # Ensure LaunchAgents directory exists
    local launchagents_dir="$HOME/Library/LaunchAgents"
    if [[ ! -d "$launchagents_dir" ]]; then
        mkdir -p "$launchagents_dir"
        print_status "Created LaunchAgents directory"
    fi
    
    # Ensure log directory exists
    ensure_log_directory
    
    # Copy plist file
    if cp "$PLIST_SOURCE" "$PLIST_TARGET"; then
        print_success "Copied plist to LaunchAgents directory"
    else
        print_error "Failed to copy plist file"
        return 1
    fi
    
    # Load the service
    if launchctl load "$PLIST_TARGET"; then
        print_success "Service loaded successfully"
    else
        print_error "Failed to load service"
        return 1
    fi
    
    print_success "Backup service installed and loaded!"
    print_status "The service will run daily at 2:00 AM"
    print_status "Use '$0 status' to check service status"
}

uninstall_service() {
    print_status "Uninstalling backup service..."
    
    # Try to unload first
    if launchctl list | grep -q "$SERVICE_NAME"; then
        if launchctl unload "$PLIST_TARGET" 2>/dev/null; then
            print_success "Service unloaded"
        else
            print_warning "Could not unload service (may not be running)"
        fi
    fi
    
    # Remove plist file
    if [[ -f "$PLIST_TARGET" ]]; then
        if rm "$PLIST_TARGET"; then
            print_success "Removed plist file"
        else
            print_error "Failed to remove plist file"
            return 1
        fi
    else
        print_warning "Plist file not found"
    fi
    
    print_success "Backup service uninstalled!"
}

start_service() {
    print_status "Starting backup service..."
    
    if ! [[ -f "$PLIST_TARGET" ]]; then
        print_error "Service not installed. Run '$0 install' first."
        return 1
    fi
    
    if launchctl load "$PLIST_TARGET" 2>/dev/null; then
        print_success "Service started"
    else
        print_warning "Service may already be running"
    fi
}

stop_service() {
    print_status "Stopping backup service..."
    
    if launchctl unload "$PLIST_TARGET" 2>/dev/null; then
        print_success "Service stopped"
    else
        print_warning "Service may not be running"
    fi
}

show_status() {
    print_status "Backup service status:"
    echo "=============================================================================="
    
    # Check if plist exists
    if [[ -f "$PLIST_TARGET" ]]; then
        print_success "Service plist installed: $PLIST_TARGET"
    else
        print_error "Service plist not found: $PLIST_TARGET"
        print_status "Run '$0 install' to install the service"
        return 1
    fi
    
    # Check if service is loaded
    if launchctl list | grep -q "$SERVICE_NAME"; then
        print_success "Service is loaded and active"
        
        # Get detailed status
        echo ""
        print_status "Service details:"
        launchctl list | grep "$SERVICE_NAME" || true
        
        echo ""
        print_status "Next execution time:"
        # Note: launchctl doesn't easily show next run time, but we can show the schedule
        echo "Daily at 2:00 AM (configured in plist)"
    else
        print_warning "Service is installed but not loaded"
        print_status "Run '$0 start' to start the service"
    fi
    
    # Check recent backups
    echo ""
    print_status "Recent backup activity:"
    if [[ -f "$LOG_DIR/launchd-backup.log" ]]; then
        echo "Last backup log entries:"
        tail -5 "$LOG_DIR/launchd-backup.log" 2>/dev/null || echo "No recent entries"
    else
        echo "No backup logs found yet"
    fi
    
    echo "=============================================================================="
}

show_logs() {
    print_status "Recent backup logs:"
    echo "=============================================================================="
    
    # Show standard output logs
    if [[ -f "$LOG_DIR/launchd-backup.log" ]]; then
        echo "=== STANDARD OUTPUT (last 20 lines) ==="
        tail -20 "$LOG_DIR/launchd-backup.log"
        echo ""
    else
        print_warning "No standard output logs found"
    fi
    
    # Show error logs
    if [[ -f "$LOG_DIR/launchd-backup-error.log" ]]; then
        echo "=== ERROR OUTPUT (last 10 lines) ==="
        tail -10 "$LOG_DIR/launchd-backup-error.log"
        echo ""
    else
        print_status "No error logs found (this is good!)"
    fi
    
    # Show general backup logs
    if [[ -d "$LOG_DIR" ]]; then
        echo "=== AVAILABLE LOG FILES ==="
        ls -la "$LOG_DIR"/*.log 2>/dev/null | head -10 || echo "No backup logs found"
    fi
    
    echo "=============================================================================="
}

run_test_backup() {
    print_status "Running test backup manually..."
    echo "=============================================================================="
    
    # Ensure log directory exists
    ensure_log_directory
    
    # Run backup script directly
    if "$SCRIPT_DIR/backup-restic.sh"; then
        print_success "Test backup completed successfully!"
    else
        print_error "Test backup failed!"
        return 1
    fi
    
    echo "=============================================================================="
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    local command="${1:-help}"
    
    case "$command" in
        install)
            install_service
            ;;
        uninstall)
            uninstall_service
            ;;
        start)
            start_service
            ;;
        stop)
            stop_service
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        test)
            run_test_backup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi