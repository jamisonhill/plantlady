#!/bin/bash

# PlantLady NAS Deployment Script
# Usage: ./deploy.sh <NAS_IP>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh <NAS_IP>"
    echo "Example: ./deploy.sh 192.168.1.100"
    exit 1
fi

NAS_IP=$1
DEPLOY_PATH="/volume1/docker/plantlady"

echo "🌱 PlantLady NAS Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Target: admin@$NAS_IP"
echo "Path: $DEPLOY_PATH"
echo ""

# Step 1: Create directories on NAS
echo "📁 Creating directories on NAS..."
ssh admin@$NAS_IP "mkdir -p $DEPLOY_PATH/{db,photos,frontend} && chmod -R 755 $DEPLOY_PATH"

# Step 2: Copy core files
echo "📋 Copying docker-compose.yml..."
scp docker-compose.yml admin@$NAS_IP:$DEPLOY_PATH/

echo "📋 Copying nginx config..."
scp -r nginx admin@$NAS_IP:$DEPLOY_PATH/

echo "📋 Copying API code..."
scp -r api admin@$NAS_IP:$DEPLOY_PATH/

echo "📋 Copying .env template..."
scp .env.example admin@$NAS_IP:$DEPLOY_PATH/.env

# Step 3: Build and copy frontend
echo "🔨 Building frontend..."
cd app
npm run build > /dev/null 2>&1
cd ..

echo "📦 Copying frontend build..."
scp -r app/dist/* admin@$NAS_IP:$DEPLOY_PATH/frontend/

# Step 4: Summary
echo ""
echo "✅ Files deployed successfully!"
echo ""
echo "Next steps:"
echo "1. SSH into NAS: ssh admin@$NAS_IP"
echo "2. Edit .env with strong password: nano $DEPLOY_PATH/.env"
echo "3. Deploy: cd $DEPLOY_PATH && docker-compose up -d"
echo "4. Test: curl http://localhost:3010/health"
echo ""
echo "Full guide: /tmp/NAS_DEPLOYMENT_CHECKLIST.md"
