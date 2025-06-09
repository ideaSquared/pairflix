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

# Check for SSL certificates
echo "🔐 Checking SSL certificates..."
if [[ ! -f nginx/ssl/cert.pem ]] || [[ ! -f nginx/ssl/key.pem ]]; then
    echo "⚠️  Warning: SSL certificates not found in nginx/ssl/"
    echo "   For production, ensure you have:"
    echo "   - nginx/ssl/cert.pem (SSL certificate)"
    echo "   - nginx/ssl/key.pem (SSL private key)"
    echo ""
    
    # Detect operating system for certificate generation
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "${WINDIR}" ]]; then
        echo "   For Windows development/testing, generate self-signed certificates:"
        echo "   mkdir nginx\\ssl 2>nul || cd ."
        echo "   cd nginx\\ssl"
        echo "   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
        echo "     -keyout key.pem -out cert.pem \\"
        echo "     -subj \"/C=US/ST=State/L=City/O=PairFlix/CN=localhost\""
        echo "   cd ..\\.."
    else
        echo "   For Linux/macOS development/testing, generate self-signed certificates:"
        echo "   mkdir -p nginx/ssl && cd nginx/ssl"
        echo "   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\"
        echo "     -keyout key.pem -out cert.pem \\"
        echo "     -subj \"/C=US/ST=State/L=City/O=PairFlix/CN=localhost\""
        echo "   cd ../.."
    fi
    echo ""
    
    # Auto-generate certificates for development
    if [[ "${ENVIRONMENT:-}" == "development" ]]; then
        echo "🔐 Auto-generating self-signed certificates for development..."
        
        # Create directory with cross-platform command
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "${WINDIR}" ]]; then
            # Windows-specific commands
            cmd //c "mkdir nginx\\ssl 2>nul || cd ."
            cd nginx/ssl
        else
            # Unix-like systems
            mkdir -p nginx/ssl
            cd nginx/ssl
        fi
        
        # Generate certificate (openssl should work on all platforms with Git Bash)
        if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "${WINDIR}" ]]; then
            # Windows Git Bash - prevent path conversion
            MSYS_NO_PATHCONV=1 openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout key.pem -out cert.pem \
                -subj "/C=US/ST=State/L=City/O=PairFlix/CN=localhost" 2>/dev/null || {
                echo "❌ Failed to generate SSL certificates. Please install OpenSSL or generate them manually."
                cd - > /dev/null
                exit 1
            }
        else
            # Unix-like systems
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout key.pem -out cert.pem \
                -subj "/C=US/ST=State/L=City/O=PairFlix/CN=localhost" 2>/dev/null || {
                echo "❌ Failed to generate SSL certificates. Please install OpenSSL or generate them manually."
                cd - > /dev/null
                exit 1
            }
        fi
        
        # Set permissions (Unix-like systems only)
        if [[ "$OSTYPE" != "msys" ]] && [[ "$OSTYPE" != "win32" ]] && [[ -z "${WINDIR}" ]]; then
            chmod 600 key.pem
            chmod 644 cert.pem
        fi
        
        cd - > /dev/null
        echo "✅ Self-signed certificates generated"
    else
        read -p "   Continue without SSL certificates? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled. Please configure SSL certificates."
            exit 1
        fi
    fi
else
    echo "✅ SSL certificates found"
fi

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
if docker-compose -f "${COMPOSE_FILE}" ps -q >/dev/null 2>&1; then
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
echo "  - Client App: https://localhost/ (HTTP redirects to HTTPS)"
echo "  - Admin App: https://localhost/admin/"
echo "  - API: https://localhost/api/"
echo ""
echo "To check status: docker-compose -f ${COMPOSE_FILE} ps"
echo "To view logs: docker-compose -f ${COMPOSE_FILE} logs -f" 