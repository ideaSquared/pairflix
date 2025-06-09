#!/bin/bash

# Deploy PairFlix to production
# Usage: ./scripts/deploy-production.sh [version]

set -e

# Configuration
VERSION=${1:-$(git describe --tags --always)}
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

echo "Deploying PairFlix version: ${VERSION}"

# Check if required files exist
if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "❌ Error: ${COMPOSE_FILE} not found"
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "❌ Error: ${ENV_FILE} not found"
  echo "Please create ${ENV_FILE} with required environment variables"
  exit 1
fi

# Validate environment variables
source "${ENV_FILE}"
required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "TMDB_API_KEY")
for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Error: $var is not set in ${ENV_FILE}"
    exit 1
  fi
done

# Export version for docker-compose
export VERSION

echo "🔍 Checking if images exist..."
if ! docker image inspect "pairflix-backend:${VERSION}" >/dev/null 2>&1; then
  echo "❌ Error: pairflix-backend:${VERSION} not found"
  echo "Run ./scripts/build-production.sh first"
  exit 1
fi

if ! docker image inspect "pairflix-client:${VERSION}" >/dev/null 2>&1; then
  echo "❌ Error: pairflix-client:${VERSION} not found"
  echo "Run ./scripts/build-production.sh first"
  exit 1
fi

if ! docker image inspect "pairflix-admin:${VERSION}" >/dev/null 2>&1; then
  echo "❌ Error: pairflix-admin:${VERSION} not found"
  echo "Run ./scripts/build-production.sh first"
  exit 1
fi

echo "✅ All images found"

# Create backup of current deployment (if exists)
if [[ -n "$(docker-compose -f "${COMPOSE_FILE}" ps -q)" ]]; then
  echo "📦 Creating backup of current deployment..."
  BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
  mkdir -p "${BACKUP_DIR}"
  
  # Export current environment
  docker-compose -f "${COMPOSE_FILE}" config > "${BACKUP_DIR}/docker-compose.yml"
  
  # Backup database
  echo "🗃️ Backing up database..."
  docker-compose -f "${COMPOSE_FILE}" exec -T db pg_dump -U postgres pairflix > "${BACKUP_DIR}/database.sql" || true
  
  echo "✅ Backup created in ${BACKUP_DIR}"
fi

# Deploy new version
echo "🚀 Deploying new version..."

# Pull any updated base images
docker-compose -f "${COMPOSE_FILE}" pull db nginx

# Start deployment
docker-compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
timeout=300
elapsed=0
while [[ $elapsed -lt $timeout ]]; do
  if docker-compose -f "${COMPOSE_FILE}" ps | grep -q "(healthy)"; then
    if [[ $(docker-compose -f "${COMPOSE_FILE}" ps | grep -c "(healthy)") -eq 5 ]]; then
      echo "✅ All services are healthy"
      break
    fi
  fi
  
  if [[ $(docker-compose -f "${COMPOSE_FILE}" ps | grep -c "(unhealthy)") -gt 0 ]]; then
    echo "❌ Some services are unhealthy"
    echo "Service status:"
    docker-compose -f "${COMPOSE_FILE}" ps
    exit 1
  fi
  
  sleep 5
  elapsed=$((elapsed + 5))
  echo "Waiting... ($elapsed/${timeout}s)"
done

if [[ $elapsed -ge $timeout ]]; then
  echo "❌ Timeout waiting for services to be healthy"
  echo "Service status:"
  docker-compose -f "${COMPOSE_FILE}" ps
  exit 1
fi

# Run health checks
echo "🔍 Running health checks..."
if curl -f http://localhost/health >/dev/null 2>&1; then
  echo "✅ Frontend health check passed"
else
  echo "❌ Frontend health check failed"
  exit 1
fi

if curl -f http://localhost/api/health >/dev/null 2>&1; then
  echo "✅ Backend health check passed"
else
  echo "❌ Backend health check failed"
  exit 1
fi

# Clean up old images (keep last 3 versions)
echo "🧹 Cleaning up old images..."
docker images | grep pairflix | awk '{print $1":"$2}' | tail -n +4 | xargs -r docker rmi || true

echo ""
echo "🎉 Deployment successful!"
echo "Version ${VERSION} is now running"
echo ""
echo "Service URLs:"
echo "  - Client App: http://localhost/"
echo "  - Admin App: http://localhost/admin/"
echo "  - API: http://localhost/api/"
echo ""
echo "To check status: docker-compose -f ${COMPOSE_FILE} ps"
echo "To view logs: docker-compose -f ${COMPOSE_FILE} logs -f" 