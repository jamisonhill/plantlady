# PlantLady Scripts

## NAS Helper Script (`nas-helper.sh`)

Convenient CLI tool for managing PlantLady deployment on the NAS.

### Setup

1. Ensure SSH key-based auth is configured on the NAS (no password needed)
2. Environment variables are loaded from `.env.local`:
   - `NAS_IP` - NAS IP address
   - `NAS_USER` - SSH user
   - `NAS_DOCKER_PATH` - Docker compose path

### Usage

```bash
./scripts/nas-helper.sh <command> [args]
```

### Commands

| Command | Description |
|---------|-------------|
| `db-status` | Show database table row counts |
| `docker-status` | Check Docker service status |
| `logs-backend [N]` | Show last N lines of backend logs (default: 50) |
| `logs-db [N]` | Show last N lines of database logs (default: 50) |
| `restart <service>` | Restart a service (api, db, nginx) |
| `backup-db` | Backup database to `/tmp/plantlady-backups/` |
| `health-check` | Run full health check of all services |
| `help` | Show help message |

### Examples

```bash
# Check database table counts
./scripts/nas-helper.sh db-status

# View last 100 lines of backend logs
./scripts/nas-helper.sh logs-backend 100

# Restart API service
./scripts/nas-helper.sh restart api

# Run full health check
./scripts/nas-helper.sh health-check

# Backup database
./scripts/nas-helper.sh backup-db
```

### Authentication

The script uses SSH key-based authentication. If you haven't set up key-based auth yet:

1. Generate SSH key (if needed):
   ```bash
   ssh-keygen -t rsa -b 4096
   ```

2. Copy public key to NAS:
   ```bash
   ssh jamison.hill@192.168.0.9
   mkdir -p ~/.ssh
   echo '<paste-your-public-key-content>' >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   exit
   ```

3. Test key-based auth (should not prompt for password):
   ```bash
   ssh jamison.hill@192.168.0.9 "echo 'Connected!'"
   ```

### Troubleshooting

**Docker command not found on NAS:**
- The NAS shell may not have docker in PATH for SSH sessions
- Try using full path: `/usr/local/bin/docker` or `/opt/docker/bin/docker`
- Contact NAS admin to update SSH profile

**SSH permission denied:**
- Ensure your public key is in `~/.ssh/authorized_keys` on the NAS
- Check file permissions: `~/.ssh/authorized_keys` should be 600, `~/.ssh/` should be 700

**Connection timeout:**
- Verify `NAS_IP` in `.env.local` is correct
- Check network connectivity: `ping 192.168.0.9`
