#!/bin/bash

# Build production Docker images for PairFlix
# Usage: ./scripts/build-production.sh [version]

set -e

# Get version from argument or git
VERSION=${1:-$(git describe --tags --always)}
echo "Building PairFlix production images with version: ${VERSION}"

# Enable BuildKit for better caching and parallel builds
export DOCKER_BUILDKIT=1

# Build backend
echo "Building backend..."
docker build \
  --file backend/Dockerfile.prod \
  --tag pairflix-backend:${VERSION} \
  --tag pairflix-backend:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  .

# Build client app
echo "Building client app..."
docker build \
  --file app.client/Dockerfile.prod \
  --tag pairflix-client:${VERSION} \
  --tag pairflix-client:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  .

# Build admin app
echo "Building admin app..."
docker build \
  --file app.admin/Dockerfile.prod \
  --tag pairflix-admin:${VERSION} \
  --tag pairflix-admin:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  .

echo "✅ All images built successfully!"
echo "Images created:"
echo "  - pairflix-backend:${VERSION}"
echo "  - pairflix-client:${VERSION}"
echo "  - pairflix-admin:${VERSION}"

# Show image sizes
echo ""
echo "Image sizes:"
docker images | grep pairflix | grep ${VERSION}

echo ""
echo "To deploy, run:"
echo "  export VERSION=${VERSION}"
echo "  docker-compose -f docker-compose.prod.yml up -d" 