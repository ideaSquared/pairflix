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
- Check SSL certificates (auto-generate for development)
- Check that images exist
- Create database backup (if deployment exists)
- Deploy new version
- Run health checks
- Clean up old images

## Windows-Specific Instructions

### Requirements

- **Docker Desktop for Windows** with WSL2 backend (recommended)
- **PowerShell 5.1+** or **Windows Terminal**
- **Git for Windows** (includes OpenSSL and Git Bash)

### SSL Certificate Generation

**Option 1 - PowerShell Script (Recommended):**

```powershell
.\scripts\generate-ssl-certificates.ps1
```

**Option 2 - Windows Batch Script:**

```cmd
scripts\generate-ssl-certificates.bat
```

**Option 3 - Git Bash (Manual):**

```bash
mkdir -p nginx/ssl && cd nginx/ssl
MSYS_NO_PATHCONV=1 openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=US/ST=State/L=City/O=PairFlix/CN=localhost"
cd ../..
```

**Option 4 - Auto-Generation via Deployment Script:**

```bash
# The deployment script can auto-generate certificates in development mode
ENVIRONMENT=development bash scripts/deploy-production.sh
```

All options create valid SSL certificates with:

- **Subject**: `C=US, ST=State, L=City, O=PairFlix, CN=localhost`
- **Validity**: 365 days
- **Key Size**: RSA 2048-bit
- **Files Created**: `nginx/ssl/cert.pem` and `nginx/ssl/key.pem`

### Running Scripts

**PowerShell:**

```powershell
# Set execution policy if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run build script via Git Bash
bash scripts/build-production.sh

# Run deployment script via Git Bash
bash scripts/deploy-production.sh
```

**Command Prompt:**

```cmd
REM Generate SSL certificates first
scripts\generate-ssl-certificates.bat

REM Run Docker build and deploy via Git Bash
"C:\Program Files\Git\bin\bash.exe" scripts/build-production.sh
"C:\Program Files\Git\bin\bash.exe" scripts/deploy-production.sh

REM Alternative: Use deployment script auto-generation
"C:\Program Files\Git\bin\bash.exe" -c "ENVIRONMENT=development bash scripts/deploy-production.sh"
```

**Git Bash (Recommended for Windows):**

```bash
# Generate SSL certificates (any of these work)
.\scripts\generate-ssl-certificates.ps1              # PowerShell script
cmd //c scripts\\generate-ssl-certificates.bat       # Batch script
ENVIRONMENT=development bash scripts/deploy-production.sh  # Auto-generate

# Build and deploy
bash scripts/build-production.sh
bash scripts/deploy-production.sh
```

### Windows Path Considerations

- Use forward slashes (/) in Docker volume mounts
- Git Bash provides Unix-like environment for scripts
- PowerShell scripts handle Windows-specific file operations
- Docker Desktop automatically translates Windows paths

### Tested Windows Compatibility

All SSL certificate generation methods have been thoroughly tested on Windows:

✅ **PowerShell Script**: Works with PowerShell 5.1+ and Windows Terminal  
✅ **Windows Batch Script**: Works with Command Prompt and Git Bash  
✅ **Git Bash Manual**: Requires `MSYS_NO_PATHCONV=1` to prevent path conversion  
✅ **Deployment Auto-Generation**: Works in development mode  
✅ **Certificate Validation**: All methods create valid OpenSSL certificates  
✅ **Nginx Configuration**: Syntax validated and HTTPS redirect tested

**Verification Commands:**

```bash
# Verify certificates were created
ls -la nginx/ssl/

# Check certificate details
openssl x509 -in nginx/ssl/cert.pem -noout -subject -dates

# Test nginx configuration
docker run --rm -v "$(pwd)/nginx/conf.d:/etc/nginx/conf.d:ro" nginx:alpine nginx -t
```

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

**SSL Certificate Issues:**

```bash
# Check if certificates exist
ls -la nginx/ssl/

# Verify certificate validity
openssl x509 -in nginx/ssl/cert.pem -noout -text

# Test certificate and key match
openssl x509 -noout -modulus -in nginx/ssl/cert.pem | openssl md5
openssl rsa -noout -modulus -in nginx/ssl/key.pem | openssl md5

# Regenerate certificates (Windows)
scripts\generate-ssl-certificates.bat

# Regenerate certificates (PowerShell)
.\scripts\generate-ssl-certificates.ps1

# Test HTTPS redirect
curl -I http://localhost  # Should return 301 redirect
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

## Quick Reference: Windows SSL Commands

All commands tested and verified on Windows 10/11:

| **Method**      | **Command**                                                                                                                                                                      | **Notes**                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **PowerShell**  | `.\scripts\generate-ssl-certificates.ps1`                                                                                                                                        | Recommended, works with Windows Terminal |
| **Batch**       | `scripts\generate-ssl-certificates.bat`                                                                                                                                          | Works with Command Prompt                |
| **Git Bash**    | `MSYS_NO_PATHCONV=1 openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -subj "/C=US/ST=State/L=City/O=PairFlix/CN=localhost"` | Manual approach                          |
| **Auto-Deploy** | `ENVIRONMENT=development bash scripts/deploy-production.sh`                                                                                                                      | Auto-generates + deploys                 |

**Full Deployment Sequence:**

```bash
# 1. Generate SSL certificates (choose one)
.\scripts\generate-ssl-certificates.ps1
# OR
scripts\generate-ssl-certificates.bat

# 2. Build and deploy
bash scripts/build-production.sh
bash scripts/deploy-production.sh
```

## Production Checklist

Before deploying to production:

- [ ] Environment variables are set in `.env.production`
- [ ] SSL certificates are configured (use tested commands above)
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
