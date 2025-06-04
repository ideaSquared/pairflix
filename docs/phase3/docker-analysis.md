    # Docker Build Optimization Analysis

_Created: June 3, 2025_
_Phase 3: Docker Optimization for Production_

## Current Setup Analysis

The current Docker setup in PairFlix consists of:

1. **Development-focused Dockerfiles** in each application directory:
   - `app.client/Dockerfile`
   - `app.admin/Dockerfile`
   - `backend/Dockerfile`
2. **Docker Compose configuration** for local development:
   - `docker-compose.yml` (main configuration)
   - `docker-compose.override.yml` (local overrides)

### Positive Aspects of Current Setup

1. **Multi-stage build** for component library integration
2. **Separation of services** in Docker Compose
3. **Volume mounting** for development hot-reloading

### Current Limitations

1. **Development-oriented configuration** not optimized for production
2. **No distinct production builds** with minimized assets
3. **Missing security considerations** for production environments
4. **Limited build caching** strategy
5. **No health checks** for robust orchestration
6. **No container optimization** for size and performance

## Detailed Analysis by Component

### Admin Dockerfile

```dockerfile
# Build components library stage
FROM node:20-alpine AS components-builder

WORKDIR /app

# Copy the components library package.json and source code
COPY lib.components/package*.json ./lib.components/
COPY lib.components/tsconfig*.json ./lib.components/
COPY lib.components/vite.config.ts ./lib.components/
COPY lib.components/src/ ./lib.components/src/

# Install dependencies and build components
WORKDIR /app/lib.components
RUN npm install
RUN npm run build

# Build admin app stage
FROM node:20-alpine

WORKDIR /app

# Copy package.json files
COPY app.admin/package*.json ./

# Copy the built components from the previous stage
COPY --from=components-builder /app/lib.components/dist ./node_modules/@pairflix/components/dist
COPY --from=components-builder /app/lib.components/package.json ./node_modules/@pairflix/components/

# Install dependencies
RUN npm install

# Add rest of the admin code
COPY app.admin/ .

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host"]
```

**Issues:**

- Uses development server for runtime
- Lacks production build step
- No npm cache utilization
- No image size optimization
- No security considerations (running as root)
- No health check implementation

### Client and Backend Dockerfiles

Similar issues are expected in the client and backend Dockerfiles.

### Docker Compose Setup

```yaml
services:
  backend:
    build: ./backend
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/pairflix
      - JWT_SECRET=${JWT_SECRET}
      - TMDB_API_KEY=${TMDB_API_KEY}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  app.client:
    build:
      context: .
      dockerfile: ./app.client/Dockerfile
    ports:
      - '5173:5173'
    environment:
      - VITE_API_URL=http://localhost:3000
    volumes:
      - ./app.client:/app/app.client
      - ./lib.components:/app/lib.components
      - /app/app.client/node_modules
      - /app/lib.components/node_modules
    depends_on:
      - backend

  app.admin:
    build:
      context: .
      dockerfile: ./app.admin/Dockerfile
    ports:
      - '5174:5174'
    environment:
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - backend
    volumes:
      - ./app.admin:/app/app.admin
      - ./lib.components:/app/lib.components
      - /app/app.admin/node_modules
      - /app/lib.components/node_modules

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=pairflix
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Issues:**

- No production-specific configuration
- No resource limits defined
- No separation between development and production environments
- Missing networking security considerations

## Optimization Opportunities

### 1. Multi-Stage Production Builds

Create optimized production Dockerfiles with proper multi-stage builds:

```dockerfile
# Example optimized production Dockerfile for admin app
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY app.admin/package*.json ./
COPY lib.components/package*.json ./lib.components/
RUN npm ci --only=production

# Stage 2: Components builder
FROM node:20-alpine AS components-builder
WORKDIR /app
COPY lib.components/ ./lib.components/
COPY --from=deps /app/node_modules/ ./node_modules/
WORKDIR /app/lib.components
RUN npm ci
RUN npm run build

# Stage 3: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY app.admin/ ./
COPY --from=components-builder /app/lib.components/dist ./node_modules/@pairflix/components/dist
COPY --from=components-builder /app/lib.components/package.json ./node_modules/@pairflix/components/package.json
COPY --from=deps /app/node_modules/ ./node_modules/
RUN npm run build

# Stage 4: Runner
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY app.admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```

### 2. Layer Caching Strategy

Optimize for build caching by separating dependency installation from code changes:

1. Copy package.json and install dependencies first
2. Then copy source code and build
3. Use `.dockerignore` to exclude unnecessary files

### 3. Production-Specific Docker Compose

Create a production-specific docker-compose file:

```yaml
# docker-compose.prod.yml example
version: '3.8'
services:
  backend:
    image: pairflix-backend:${VERSION}
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  app.client:
    image: pairflix-client:${VERSION}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ['CMD', 'wget', '--spider', 'http://localhost']
      interval: 30s
      timeout: 5s
      retries: 3

  app.admin:
    image: pairflix-admin:${VERSION}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ['CMD', 'wget', '--spider', 'http://localhost']
      interval: 30s
      timeout: 5s
      retries: 3

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app.client
      - app.admin
      - backend
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M
    healthcheck:
      test: ['CMD', 'nginx', '-t']
      interval: 30s
      timeout: 5s
      retries: 3
```

### 4. Security Enhancements

1. **Non-root user execution**:

```dockerfile
USER node
```

2. **Environment variable security**:
   Use Docker secrets for sensitive information.

3. **Image scanning**:
   Add vulnerability scanning with tools like Trivy.

### 5. Image Size Optimization

1. Use **alpine-based images** for smaller footprint
2. Clean npm caches after installation:

```dockerfile
RUN npm ci && npm cache clean --force
```

3. Remove development dependencies from production builds
4. Use `.dockerignore` to exclude unnecessary files

### 6. Build Performance Improvements

1. Implement **BuildKit** for improved caching and parallel builds

```bash
DOCKER_BUILDKIT=1 docker build -t pairflix-admin .
```

2. Use **cache mounting** for node_modules:

```dockerfile
RUN --mount=type=cache,target=/app/.npm \
    npm ci --cache /app/.npm
```

## Implementation Recommendations

### 1. Separate Production Dockerfiles

Create separate production Dockerfiles for each application:

- `app.client/Dockerfile.prod`
- `app.admin/Dockerfile.prod`
- `backend/Dockerfile.prod`

### 2. Production Docker Compose Setup

Create a production-specific docker-compose file:

- `docker-compose.prod.yml`

### 3. Build and Deployment Scripts

Create scripts for building production-ready images:

```bash
#!/bin/bash
# build-production.sh
export VERSION=$(git describe --tags --always)
docker build -f app.client/Dockerfile.prod -t pairflix-client:${VERSION} .
docker build -f app.admin/Dockerfile.prod -t pairflix-admin:${VERSION} .
docker build -f backend/Dockerfile.prod -t pairflix-backend:${VERSION} .
```

### 4. Health Check Implementation

Add health check endpoints to all services:

- Backend: `/api/health`
- Frontend apps: Static health file

### 5. Environment Variable Management

Create a proper environment variable strategy:

- `.env.production` for non-sensitive configuration
- Docker secrets for sensitive data

## Success Metrics

We'll measure the success of our Docker optimization efforts by:

1. **Image size reduction**: Target 30-50% smaller images
2. **Build time improvement**: Target 50% faster builds
3. **Startup time reduction**: Target 20% faster startup
4. **Resource utilization improvement**: Target 30% less memory usage
5. **Security posture improvement**: Zero high/critical vulnerabilities

## Next Steps

1. Implement optimized production Dockerfiles for each application
2. Create production Docker Compose configuration
3. Set up build scripts and CI/CD pipeline integration
4. Test deployment in a staging environment
5. Document production deployment procedures
6. Implement monitoring and alerting for containerized services

## References

- Docker multi-stage build documentation: https://docs.docker.com/build/building/multi-stage/
- Docker Compose production best practices: https://docs.docker.com/compose/production/
- BuildKit documentation: https://docs.docker.com/build/buildkit/
- NGINX configuration for SPAs: https://www.nginx.com/blog/nginx-nodejs-websockets-socketio/
- Container security best practices: https://snyk.io/blog/10-docker-image-security-best-practices/
