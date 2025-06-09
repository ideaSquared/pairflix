# PairFlix Production Docker Guide

This guide covers the production-optimized Docker deployment for PairFlix.

## Overview

The production setup includes:

- Multi-stage Docker builds for optimized image sizes
- Security hardening with non-root users
- Health checks for all services
- Resource limits and monitoring
- Nginx reverse proxy with rate limiting
- Automated build and deployment scripts

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Client App     │    │   Admin App     │
│   (Port 80/443) │────│   (nginx:alpine) │    │   (nginx:alpine)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────│   Backend API   │─────────────┘
                        │  (node:alpine)  │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │  (postgres:15)  │
                        └─────────────────┘
```

## Quick Start

### 1. Environment Setup

Copy the environment template and fill in your values:

```bash
cp env.production.template .env.production
```

Edit `.env.production` with your actual values:

- `POSTGRES_PASSWORD`: Strong password for PostgreSQL
- `JWT_SECRET`: Secure random string for JWT tokens
- `TMDB_API_KEY`: Your TMDb API key

### 2. Build Production Images

```bash
./scripts/build-production.sh
```

This will create optimized production images for all services.

### 3. Deploy

```bash
./scripts/deploy-production.sh
```

This will:

- Validate environment variables
- Check that images exist
- Create database backup (if deployment exists)
- Deploy new version
- Run health checks
- Clean up old images

## Manual Operations

### Building Individual Images

Build with BuildKit for better performance:

```bash
export DOCKER_BUILDKIT=1

# Backend
docker build -f backend/Dockerfile.prod -t pairflix-backend:latest .

# Client App
docker build -f app.client/Dockerfile.prod -t pairflix-client:latest .

# Admin App
docker build -f app.admin/Dockerfile.prod -t pairflix-admin:latest .
```

### Starting Services

```bash
# Start all services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Start specific service
docker-compose -f docker-compose.prod.yml up -d backend

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Stopping Services

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop with volume cleanup (⚠️ This will delete data!)
docker-compose -f docker-compose.prod.yml down -v
```

## Monitoring

### Health Checks

All services include health checks:

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Manual health checks
curl http://localhost/health           # Global health
curl http://localhost/api/health       # Backend API
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs app.client
docker-compose -f docker-compose.prod.yml logs app.admin
```

### Database Backup

```bash
# Manual backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres pairflix > backup.sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres pairflix < backup.sql
```

## Security Features

### Non-Root Execution

- All application containers run as non-root user (UID 1001)
- Nginx containers use nginx user instead of root

### Security Headers

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Rate Limiting

- API endpoints: 10 requests/second (burst: 20)
- Login endpoint: 5 requests/minute (burst: 3)

### Network Isolation

- All services communicate through isolated Docker network
- Only nginx proxy exposes ports to host

## Performance Optimizations

### Build Optimizations

- Multi-stage builds reduce final image sizes
- BuildKit caching for faster rebuilds
- Dependency layer caching
- Production-only dependencies in final images

### Runtime Optimizations

- Gzip compression for all text assets
- Static asset caching (1 year for immutable assets)
- Nginx sendfile and TCP optimizations
- Resource limits prevent memory leaks

### Image Sizes (Approximate)

- Backend: ~150MB (vs ~400MB unoptimized)
- Client App: ~25MB (vs ~80MB unoptimized)
- Admin App: ~25MB (vs ~80MB unoptimized)

## Troubleshooting

### Common Issues

**Services not starting:**

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check specific service
docker-compose -f docker-compose.prod.yml logs backend
```

**Health checks failing:**

```bash
# Test manually
curl -f http://localhost/health
curl -f http://localhost/api/health

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

**Database connection issues:**

```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Test database connection
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d pairflix -c "SELECT 1;"
```

**Build failures:**

```bash
# Clean build cache
docker builder prune

# Build with no cache
docker build --no-cache -f backend/Dockerfile.prod -t pairflix-backend:latest .
```

### Rollback

If deployment fails, you can rollback:

```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Restore from backup (check backups/ directory)
BACKUP_DIR="backups/YYYYMMDD_HHMMSS"
docker-compose -f docker-compose.prod.yml up -d db
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres pairflix < "${BACKUP_DIR}/database.sql"

# Deploy previous version
VERSION=previous_version ./scripts/deploy-production.sh
```

## Maintenance

### Regular Tasks

**Update base images:**

```bash
docker-compose -f docker-compose.prod.yml pull
```

**Clean up old images:**

```bash
docker image prune -f
```

**Database maintenance:**

```bash
# Vacuum database
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d pairflix -c "VACUUM ANALYZE;"
```

### Log Rotation

Configure log rotation for Docker containers:

```bash
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## SSL/HTTPS Setup

To enable HTTPS, modify the nginx configuration:

1. Place SSL certificates in `nginx/ssl/`
2. Update `nginx/conf.d/pairflix.conf` to include SSL configuration
3. Expose port 443 in docker-compose

Example SSL configuration snippet:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

## Production Checklist

Before deploying to production:

- [ ] Environment variables are set in `.env.production`
- [ ] SSL certificates are configured (if using HTTPS)
- [ ] Database backups are configured
- [ ] Log rotation is configured
- [ ] Monitoring/alerting is set up
- [ ] Resource limits are appropriate for your server
- [ ] Health check endpoints are accessible
- [ ] Security headers are properly configured

## Support

For issues related to:

- **Docker builds**: Check build logs and .dockerignore files
- **Networking**: Verify nginx configuration and Docker networking
- **Performance**: Review resource limits and monitoring data
- **Security**: Validate environment variables and access controls
