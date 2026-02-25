# PlantLady — NAS Deployment Guide

## Prerequisites
- Synology DS918+ with Docker package installed
- Portainer (optional but recommended for management)
- Cloudflare Tunnel configured for `plants.yourdomain.com`

## Step 1: Prepare NAS Folders

SSH into your NAS and create the required directory structure:

```bash
ssh admin@[NAS_IP]

# Create folders
mkdir -p /volume1/docker/plantlady/db
mkdir -p /volume1/docker/plantlady/photos
mkdir -p /volume1/docker/plantlady/frontend

# Set permissions
chmod -R 755 /volume1/docker/plantlady
```

## Step 2: Prepare Application Files

Copy the project files to NAS:

```bash
# From your local machine
scp -r ~/Ai/Seeds/* admin@[NAS_IP]:/volume1/docker/plantlady/

# Or if using Git:
cd /volume1/docker/plantlady
git clone [your-repo] .
```

## Step 3: Build Frontend

Build the React app on your local machine, then copy to NAS:

```bash
# On your local machine
cd ~/Ai/Seeds/app
npm install
npm run build

# Copy build output to NAS
scp -r dist/* admin@[NAS_IP]:/volume1/docker/plantlady/frontend/
```

## Step 4: Configure Environment

Copy `.env.example` to `.env` and update with secure values:

```bash
ssh admin@[NAS_IP]
cd /volume1/docker/plantlady

cp .env.example .env

# Edit .env with your secure database password
# DB_PASSWORD=<generate-strong-password>
nano .env
```

## Step 5: Deploy via Portainer

### Option A: Via Portainer UI

1. Navigate to Portainer → Stacks → Add stack
2. Name: `plantlady`
3. Upload `docker-compose.yml` from your computer
4. Paste `.env` contents into Environment Variables section
5. Click "Deploy the stack"

### Option B: Via Docker CLI

```bash
ssh admin@[NAS_IP]
cd /volume1/docker/plantlady

# Load environment
export $(cat .env | grep -v '#' | xargs)

# Deploy
docker-compose up -d
```

## Step 6: Verify Deployment

```bash
# Check if containers are running
docker-compose ps

# Test API health
curl http://localhost:3010/api/health

# View logs
docker-compose logs -f plantlady-api
docker-compose logs -f plantlady-db
docker-compose logs -f plantlady-nginx

# Test app from phone via Cloudflare
# https://plants.yourdomain.com
```

## Step 7: Configure Cloudflare Tunnel

In Cloudflare Dashboard:

1. Go to Zero Trust → Networks → Tunnels
2. Edit `plantlady` tunnel
3. Add Public Hostname:
   - **Subdomain**: `plants`
   - **Domain**: `yourdomain.com`
   - **Type**: HTTP
   - **URL**: `localhost:3010`
4. Save and test: `https://plants.yourdomain.com`

## Backup & Persistence

Your data is stored in NAS volumes:
- **Database**: `/volume1/docker/plantlady/db` — PostgreSQL data
- **Photos**: `/volume1/docker/plantlady/photos` — Plant photos
- **Frontend**: `/volume1/docker/plantlady/frontend` — Built React app

These are automatically backed up by your Synology backup routine.

## Monitoring

Check container health periodically:

```bash
docker-compose logs plantlady-api --tail 50
docker-compose logs plantlady-db --tail 50

# Restart if needed
docker-compose restart plantlady-api
```

## Database Access

Connect to PostgreSQL for maintenance or backups:

```bash
# From NAS shell
psql -h localhost -U plantlady -d plantlady -p 5432

# Or from remote
psql -h [NAS_IP] -U plantlady -d plantlady -p 5432
# Password: value from .env DB_PASSWORD
```

## Rebuilding Frontend

When you push frontend changes:

```bash
# On your local machine
cd ~/Ai/Seeds/app
npm install
npm run build

# Copy to NAS
scp -r dist/* admin@[NAS_IP]:/volume1/docker/plantlady/frontend/

# Restart Nginx container
ssh admin@[NAS_IP] "docker-compose restart plantlady-nginx"
```

## Troubleshooting

### App shows "Cannot reach API"
- Check if `plantlady-api` container is running: `docker-compose ps`
- Check API logs: `docker-compose logs plantlady-api`
- Verify port 3010 is exposed in docker-compose.yml

### Database won't start
- Check disk space: `df -h /volume1`
- Check logs: `docker-compose logs plantlady-db`
- Verify `/volume1/docker/plantlady/db` has write permissions

### Photos not showing
- Verify path exists: `ls -la /volume1/docker/plantlady/photos`
- Check Nginx logs: `docker-compose logs plantlady-nginx`

### Can't connect via Cloudflare
- Verify tunnel is running and authenticated in Cloudflare
- Test locally first: `curl http://localhost:3010`
- Check Nginx is healthy: `curl http://localhost:3010/health`
