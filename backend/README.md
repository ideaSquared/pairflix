# PairFlix Backend API

Express.js RESTful API server for the PairFlix movie and TV show discovery platform.

## 🚀 Overview

The PairFlix backend provides a robust API for user management, content discovery, watchlist management, and social features. Built with Node.js, Express.js, TypeScript, and PostgreSQL.

## 📋 Features

- **User Management**: Registration, authentication, and profile management
- **Content Discovery**: Integration with TMDB API for movies and TV shows
- **Watchlist Management**: Personal watchlists with ratings and reviews
- **Matching System**: Algorithm to find users with similar viewing interests
- **Activity Tracking**: Comprehensive user activity logging and feeds
- **Admin Features**: Administrative tools and content moderation
- **Security**: Rate limiting, input validation, and audit logging

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with middleware ecosystem
- **Database**: PostgreSQL 14+ with Sequelize ORM
- **Authentication**: JWT tokens with secure session management
- **External APIs**: TMDB (The Movie Database) integration
- **Security**: Rate limiting, CORS, input validation
- **Testing**: Jest with Supertest for API testing
- **Logging**: Comprehensive audit logging system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- TMDB API key

### Installation

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**

   ```bash
   # Create database
   createdb pairflix_development

   # Run migrations (if available)
   npx sequelize-cli db:migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── watchlist.controller.ts
│   │   ├── match.controller.ts
│   │   └── admin.controller.ts
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.ts         # Authentication middleware
│   │   ├── rate-limiter.ts # Rate limiting configuration
│   │   ├── error-handler.ts # Global error handling
│   │   └── request-logger.ts # Request logging
│   ├── models/             # Database models (Sequelize)
│   │   ├── User.ts
│   │   ├── WatchlistEntry.ts
│   │   ├── Match.ts
│   │   ├── ActivityLog.ts
│   │   └── AuditLog.ts
│   ├── routes/             # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── watchlist.routes.ts
│   │   ├── match.routes.ts
│   │   └── admin.routes.ts
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── watchlist.service.ts
│   │   ├── tmdb.service.ts
│   │   └── audit.service.ts
│   ├── db/                 # Database configuration
│   │   ├── connection.ts   # Database connection
│   │   └── seeders/        # Development data seeders
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── index.ts            # Application entry point
├── tests/                  # Test files
├── package.json
├── tsconfig.json
└── jest.config.ts
```

## 🔐 Authentication & Authorization

### JWT Authentication

- **Registration**: POST `/api/auth/register`
- **Login**: POST `/api/auth/login`
- **Current User**: GET `/api/auth/me`
- **Logout**: POST `/api/auth/logout`

### Role-Based Access Control

- **User Role**: Standard user permissions
- **Admin Role**: Administrative access to all resources

### Security Features

- Password hashing with bcrypt
- JWT token with configurable expiration
- Rate limiting on authentication endpoints
- Input validation and sanitization

## 🌐 API Endpoints

The PairFlix backend provides a comprehensive REST API with the following endpoint categories:

- **Authentication** (`/api/auth`): User login, logout, and authentication management
- **User Management** (`/api/user`): Profile management, preferences, and user search
- **Watchlist** (`/api/watchlist`): Watchlist CRUD operations and matching
- **Matches** (`/api/matches`): User matching and match status management
- **Activity** (`/api/activity`): Activity feeds and social features
- **Admin** (`/api/admin`): Administrative functions and system management

📖 **For complete API documentation with request/response examples, authentication requirements, and error codes, see [`../docs/api-docs.md`](../docs/api-docs.md).**

## 🔒 Security & Rate Limiting

The backend implements comprehensive security measures including rate limiting, authentication, input validation, and audit logging.

### Security Features

- **Rate Limiting**: Multiple rate limiters for different endpoint types
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: User and admin role separation
- **Input Validation**: Request validation and sanitization
- **Audit Logging**: Comprehensive security event logging
- **CORS Protection**: Configurable cross-origin request handling

### Rate Limiting Overview

- **Global**: 100 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes (brute force protection)
- **Search**: 30 requests per minute (resource protection)
- **Admin**: 50 requests per 15 minutes (admin operations)
- **Strict**: 5 requests per 15 minutes (sensitive operations)

For detailed security documentation, see [`docs/SECURITY.md`](./docs/SECURITY.md).

## 📊 Database Schema

### Core Models

#### User

- User authentication and profile information
- Preferences and settings
- Role-based permissions

#### WatchlistEntry

- User's watchlist items
- Ratings, reviews, and status tracking
- TMDB integration for content metadata

#### Match

- User matching based on watchlist similarity
- Match status and communication

#### ActivityLog

- User activity tracking
- Feed generation and social features

#### AuditLog

- Security and administrative logging
- System monitoring and troubleshooting

For detailed schema documentation, see [`../db-schema.md`](../db-schema.md).

## 🧪 Testing

### Test Structure

```bash
src/
├── __tests__/              # Integration tests
├── controllers/*.test.ts    # Controller unit tests
├── services/*.test.ts       # Service unit tests
├── middlewares/*.test.ts    # Middleware tests
└── models/*.test.ts         # Model tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user.service.test.ts
```

### Test Categories

- **Unit Tests**: Individual functions and methods
- **Integration Tests**: API endpoint testing
- **Model Tests**: Database model validation
- **Middleware Tests**: Authentication, rate limiting, etc.

## 🔄 Development Workflow

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server
npm test            # Run test suite
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/pairflix_development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# TMDB API
TMDB_API_KEY=your-tmdb-api-key

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

## 📝 Logging & Monitoring

### Audit Logging

- All user actions are logged
- Security events tracking
- Administrative operation logs
- System performance metrics

### Log Levels

- **INFO**: General application flow
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **DEBUG**: Detailed debugging information

### Monitoring Endpoints

- `GET /api/admin/system-metrics` - System health metrics
- `GET /api/admin/audit-logs` - Security and audit logs

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
# Build image
docker build -t pairflix-backend .

# Run container
docker run -p 3000:3000 pairflix-backend
```

### Environment Configuration

- Ensure all environment variables are set
- Configure database connection
- Set up TMDB API integration
- Configure CORS for production domains

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**

   - Verify PostgreSQL is running
   - Check DATABASE_URL environment variable
   - Ensure database exists

2. **TMDB API Issues**

   - Verify TMDB_API_KEY is set correctly
   - Check API rate limits
   - Validate API responses

3. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate user credentials

### Debug Mode

```bash
DEBUG=pairflix:* npm run dev
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Use conventional commit messages
4. Ensure all linting and tests pass
5. Update documentation as needed

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

---

For more information, see the [main project README](../README.md) and [API documentation](../api-docs.md).
