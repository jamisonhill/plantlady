# PlantLady Project

## Stack Overview
Full-stack plant tracking app for a single user.

- **Frontend**: React + TypeScript + Vite + Tailwind, served by nginx
- **Backend**: FastAPI (Python), PostgreSQL, Alembic migrations
- **Hosting**: Synology NAS at 192.168.0.9, exposed via Cloudflare tunnel at https://plants.duski.org
- **Container manager**: Portainer (but the stack was created OUTSIDE Portainer via `docker-compose up`)

---

## NAS / Docker Deployment

### Credentials
- **NAS IP**: 192.168.0.9
- **SSH user**: jamison.hill
- **SSH**: key-based auth, **no password needed** — `ssh jamison.hill@192.168.0.9` just works
- **Docker**: requires sudo password — `echo 'Pats4ouk' | sudo -S /usr/local/bin/docker <cmd>`
- **docker-compose**: available at `/usr/local/bin/docker-compose` (not in PATH by default)

### Key Paths on NAS
| Purpose | Path |
|---------|------|
| Compose file + .env | `/volume1/docker/plantlady/` |
| Frontend build output | `/volume1/docker/plantlady/frontend/` |
| Photos volume | `/volume1/docker/plantlady/photos/` |
| API source (staging only) | `/volume1/docker/plantlady/api/` |
| DB data | `/volume1/docker/plantlady/db/` |

### Environment Variables
Stored in `/volume1/docker/plantlady/.env`. The `docker-compose.yml` uses `${VAR}` substitution. To add a new env var:
1. Append to `.env` on the NAS
2. Force-recreate the affected container (see below)

**Current .env contains:** `DB_PASSWORD`, `DEBUG`, `ANTHROPIC_API_KEY`

### Portainer Warning
The stack shows "This stack was created outside of Portainer. Control over this stack is limited." — there is NO editor tab, NO env var UI. Do NOT try to manage env vars through Portainer. Use SSH + `.env` file instead.

---

## Deployment Recipes

### Frontend
```bash
# 1. Build
cd app && npm run build

# 2. Deploy to NAS
tar czf - -C dist . | ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "cd /volume1/docker/plantlady/frontend && rm -rf assets && tar xzf -"

# 3. Restart nginx
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S /usr/local/bin/docker restart plantlady-nginx"
```

### Recreate a container (picks up .env changes, no rebuild)
```bash
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S env PATH=/usr/local/bin:/usr/bin:/bin \
  /usr/local/bin/docker-compose -f /volume1/docker/plantlady/docker-compose.yml \
  up -d --force-recreate plantlady-api"
```

### Rebuild the API image (e.g. after changing requirements.txt or Dockerfile)
```bash
# 1. Upload the full api/ source to the NAS (write to /tmp first — sudo stdin conflict)
tar czf - -C api . | ssh -o BatchMode=yes jamison.hill@192.168.0.9 "cat > /tmp/api_src.tar.gz"
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S -p '' tar xzf /tmp/api_src.tar.gz -C /volume1/docker/plantlady/api"

# 2. Build the image (must set PATH so docker-compose can find the docker binary)
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S env PATH=/usr/local/bin:/usr/bin:/bin \
  /usr/local/bin/docker-compose -f /volume1/docker/plantlady/docker-compose.yml \
  build plantlady-api"

# 3. Recreate the container from the new image
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S env PATH=/usr/local/bin:/usr/bin:/bin \
  /usr/local/bin/docker-compose -f /volume1/docker/plantlady/docker-compose.yml \
  up -d --force-recreate plantlady-api"
```
Note: `docker-compose build` fails if you just run it without `env PATH=...` because docker is not in sudo's default PATH.

### Deploy a Python source file into the running API container
`docker cp` is BROKEN on this NAS (see below). Use this pattern instead:

```bash
# Step 1: base64-encode locally and write to /tmp inside the container
CONTENT=$(base64 -i api/routers/myfile.py | tr -d '\n')
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S -p '' /usr/local/bin/docker exec plantlady-api python3 -c \
  'import base64; data=base64.b64decode(\"${CONTENT}\"); open(\"/tmp/myfile.py\",\"wb\").write(data)'"

# Step 2: move from /tmp to the real location (direct writes to /app/ silently produce 0-byte files)
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S -p '' /usr/local/bin/docker exec plantlady-api python3 -c \
  'import shutil; shutil.move(\"/tmp/myfile.py\", \"/app/routers/myfile.py\")'"

# Step 3: restart the API so Python reloads the module
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S /usr/local/bin/docker restart plantlady-api"
```

### Run an Alembic migration
```bash
# Copy migration file into the container (alembic/versions/ is NOT volume-mounted)
CONTENT=$(base64 -i api/alembic/versions/004_my_migration.py | tr -d '\n')
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S -p '' /usr/local/bin/docker exec plantlady-api python3 -c \
  'import base64; data=base64.b64decode(\"${CONTENT}\"); open(\"/tmp/004_my_migration.py\",\"wb\").write(data)'"
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S -p '' /usr/local/bin/docker exec plantlady-api python3 -c \
  'import shutil; shutil.move(\"/tmp/004_my_migration.py\", \"/app/alembic/versions/004_my_migration.py\")'"

# Run the migration
ssh -o BatchMode=yes jamison.hill@192.168.0.9 \
  "echo 'Pats4ouk' | sudo -S /usr/local/bin/docker exec plantlady-api alembic upgrade head"
```

---

## Known Docker Quirks on This NAS

### `docker cp` is broken
`docker cp` always fails with:
```
Error: No such container:path: <container>:/proc/self/fd
```
This happens in every context (with or without sudo piping, with TTY, with `/dev/null` redirects). It's a bug in the Synology Docker version where `docker cp` treats the pipe's file descriptor as the source path.

**Always use the `docker exec python3` + `shutil.move` pattern above instead.**

### Direct writes to `/app/` paths produce 0-byte files
Opening a file in `/app/routers/` or `/app/alembic/` for writing inside the container via `open("wb")` silently truncates the file to 0 bytes without raising an error. This is an overlay filesystem issue on Synology. Writing to `/tmp/` works correctly. Always write to `/tmp/` first, then `shutil.move()` to the target path.

### `docker compose` subcommand unavailable
Use `docker-compose` (the standalone binary at `/usr/local/bin/docker-compose`), not `docker compose`.

### File transfers to NAS
SCP doesn't work reliably. Use `tar czf - | ssh "cat > /tmp/file"` or `tar czf - | ssh "tar xzf -"` patterns.

When `sudo` is needed to extract (e.g. restricted directories), write to `/tmp` first without sudo, then extract with sudo from there:
```bash
tar czf - -C source_dir . | ssh jamison.hill@192.168.0.9 "cat > /tmp/bundle.tar.gz"
ssh jamison.hill@192.168.0.9 "echo 'Pats4ouk' | sudo -S -p '' tar xzf /tmp/bundle.tar.gz -C /dest/"
```
Note: SSH no longer requires a password (key auth) — omit `-o BatchMode=yes` and `PasswordAuthentication` flags if desired, though they don't hurt.

---

## Project Architecture

See `MEMORY.md` in `.claude/projects/` for full database schema, API routes, and frontend routes.

### Containers
| Container | Image | Role |
|-----------|-------|------|
| `plantlady-db` | postgres:16-alpine | Database |
| `plantlady-api` | plantlady_plantlady-api:latest | FastAPI backend |
| `plantlady-nginx` | nginx:alpine | Serves frontend + proxies API |

### Volume Mounts (plantlady-api)
- `plantlady-photos-volume` → `/app/photos` (only mounted path — everything else in the image layer)
