#!/bin/bash
# NAS Helper Script - Common operations for PlantLady deployment

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
ENV_FILE="$PROJECT_ROOT/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env.local not found at $ENV_FILE"
  exit 1
fi

# Parse .env.local file
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^[[:space:]]*# ]] && continue
  [[ -z "$key" ]] && continue
  # Trim whitespace
  key=$(echo "$key" | xargs)
  value=$(echo "$value" | xargs)
  [ -n "$key" ] && eval "export ${key}='${value}'"
done < "$ENV_FILE"

# Validate required env vars
if [ -z "${NAS_IP:-}" ] || [ -z "${NAS_USER:-}" ] || [ -z "${NAS_DOCKER_PATH:-}" ]; then
  echo "Error: Missing NAS configuration in .env.local"
  echo "Required: NAS_IP, NAS_USER, NAS_DOCKER_PATH"
  exit 1
fi

NAS_HOST="${NAS_USER}@${NAS_IP}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }

# Database status check
db_status() {
  log_info "Checking database status..."
  ssh "$NAS_HOST" "docker exec plantlady-db psql -U plantlady -d plantlady -c \"
    SELECT
      'users' as table_name, COUNT(*) FROM users
    UNION ALL SELECT 'individual_plants', COUNT(*) FROM individual_plants
    UNION ALL SELECT 'care_schedules', COUNT(*) FROM care_schedules
    UNION ALL SELECT 'care_events', COUNT(*) FROM care_events
    ORDER BY table_name;
  \""
}

# Check Docker service status
docker_status() {
  log_info "Checking Docker service status..."
  ssh "$NAS_HOST" "docker ps --filter 'name=plantlady' --format 'table {{.Names}}\t{{.Status}}'"
}

# View backend logs
logs_backend() {
  local lines="${1:-50}"
  log_info "Showing last $lines lines of backend logs..."
  ssh "$NAS_HOST" "docker logs --tail=$lines plantlady-api"
}

# View database logs
logs_database() {
  local lines="${1:-50}"
  log_info "Showing last $lines lines of database logs..."
  ssh "$NAS_HOST" "docker logs --tail=$lines plantlady-db"
}

# Restart a service
restart_service() {
  local service="$1"
  if [ -z "$service" ]; then
    log_error "Usage: restart_service <service_name>"
    log_info "Available services: api, db, nginx"
    return 1
  fi

  local container="plantlady-${service}"
  log_info "Restarting $container..."
  ssh "$NAS_HOST" "docker restart $container"
  log_info "Service restarted. Checking status..."
  docker_status
}

# Backup database
backup_database() {
  local backup_dir="/tmp/plantlady-backups"
  mkdir -p "$backup_dir"
  local timestamp=$(date +%Y%m%d_%H%M%S)
  local backup_file="plantlady_backup_${timestamp}.sql"

  log_info "Backing up database to $backup_file..."
  ssh "$NAS_HOST" "docker exec plantlady-db pg_dump -U plantlady plantlady" > "$backup_dir/$backup_file"
  log_info "Backup complete: $backup_dir/$backup_file"
}

# Health check
health_check() {
  log_info "Running health check..."

  if ssh -q "$NAS_HOST" "exit" 2>/dev/null; then
    log_info "✓ SSH connectivity"
  else
    log_error "✗ SSH connectivity failed"
    return 1
  fi

  if ssh "$NAS_HOST" "docker ps --filter 'name=plantlady' -q | wc -l | grep -q '3'" 2>/dev/null; then
    log_info "✓ All Docker services running (3/3)"
  else
    log_warn "⚠ Not all Docker services running"
    docker_status
  fi

  if ssh "$NAS_HOST" "docker exec plantlady-db psql -U plantlady -d plantlady -c 'SELECT 1' > /dev/null 2>&1" 2>/dev/null; then
    log_info "✓ Database responding"
  else
    log_error "✗ Database check failed"
  fi

  log_info "Health check complete"
}

# Display usage
usage() {
  cat << 'EOF'
PlantLady NAS Helper - Common operations

Usage: nas-helper.sh <command> [args]

Commands:
  db-status           Show database table row counts
  docker-status       Check Docker service status
  logs-backend [N]    Show last N lines of backend logs (default: 50)
  logs-db [N]         Show last N lines of database logs (default: 50)
  restart <service>   Restart a service (api, db, nginx)
  backup-db           Backup database to /tmp/plantlady-backups/
  health-check        Run full health check of all services
  help                Show this help message

Examples:
  ./scripts/nas-helper.sh db-status
  ./scripts/nas-helper.sh logs-backend 100
  ./scripts/nas-helper.sh restart api
  ./scripts/nas-helper.sh health-check

EOF
}

# Main command router
main() {
  local cmd="${1:-help}"

  case "$cmd" in
    db-status)
      db_status
      ;;
    docker-status)
      docker_status
      ;;
    logs-backend)
      logs_backend "${2:-50}"
      ;;
    logs-db)
      logs_database "${2:-50}"
      ;;
    restart)
      restart_service "${2:-}"
      ;;
    backup-db)
      backup_database
      ;;
    health-check)
      health_check
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      log_error "Unknown command: $cmd"
      usage
      exit 1
      ;;
  esac
}

main "$@"
