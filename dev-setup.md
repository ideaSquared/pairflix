# 🚀 Development Setup Guide

This guide will help you set up the PairFlix project for local development.

## Prerequisites

- Docker and Docker Compose (latest version)
- Node.js (v18+)
- npm (v8+)
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pairflix
   ```

2. Environment Variables:
   
   Create `.env` files for both frontend and backend:

   **Backend (.env in backend/ directory):**
   ```
   NODE_ENV=development
   PORT=8000
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_REFRESH_SECRET=your_refresh_secret_key_change_this_in_production
   JWT_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=pairflix
   DB_USER=postgres
   DB_PASSWORD=postgres
   TMDB_API_KEY=your_tmdb_api_key
   ```

   **Frontend (.env in frontend/ directory):**
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

3. Start the development environment with Docker Compose:
   ```bash
   docker-compose up
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API server on port 8000
   - Frontend development server on port 3000

4. Database Initialization:
   
   The database will be automatically set up with seeds for two users.
   
   Default credentials:
   - User 1: `user1@example.com` / `password123`
   - User 2: `user2@example.com` / `password123`

## Development Workflow

### Running Without Docker

If you prefer to run components without Docker:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Testing

**Backend Tests:**
```bash
cd backend
npm test           # Run all tests
npm test:watch     # Run tests in watch mode
npm test:coverage  # Run tests with coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm test           # Run all tests
npm test:watch     # Run tests in watch mode
npm test:coverage  # Run tests with coverage report
```

### Code Formatting and Linting

The project uses ESLint and Prettier for code quality:

```bash
# Backend
cd backend
npm run lint       # Check for linting issues
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier

# Frontend
cd frontend
npm run lint       # Check for linting issues
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
```

## API Documentation

The API documentation is available at `/api-docs` when running the backend server.

## Database Management

### Accessing the Database

Connect to the PostgreSQL database:
```bash
docker-compose exec postgres psql -U postgres -d pairflix
```

### Running Migrations

```bash
# Inside the backend container
docker-compose exec backend npm run db:migrate
```

### Creating New Migrations

```bash
# Inside the backend container
docker-compose exec backend npm run db:migrate:create -- --name your_migration_name
```

## TMDb API

The application uses [The Movie Database (TMDb) API](https://developers.themoviedb.org/3/getting-started/introduction) for content metadata.

To use it:
1. Register for an account on TMDb
2. Generate an API key
3. Add the key to your backend `.env` file

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running: `docker-compose ps`
   - Check database logs: `docker-compose logs postgres`
   - Verify database environment variables in backend `.env`

2. **API Connection Issues**
   - Check that backend is running: `docker-compose ps`
   - Verify API URL in frontend `.env`
   - Check CORS settings if modifying API origins

3. **Docker Issues**
   - Restart with fresh containers: `docker-compose down && docker-compose up`
   - Rebuild images: `docker-compose build --no-cache`

### Getting Help

If you encounter issues not covered here, please:
1. Check existing issues in the project repository
2. Create a new issue with details about the problem
3. Include relevant logs and environment information