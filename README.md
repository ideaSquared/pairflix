# PairFlix

A modern movie and TV show discovery platform that enables users to create watchlists, find viewing partners, and share recommendations.

## 🎬 Overview

PairFlix is a full-stack application that helps users discover movies and TV shows, manage personal watchlists, and connect with others who share similar viewing interests. The platform features a React frontend, Express.js backend with PostgreSQL, and a comprehensive admin panel.

## 🏗️ Architecture

This is a monorepo containing multiple applications and shared libraries:

### Applications

- **`app.client/`** - Main user-facing React application
- **`app.admin/`** - Administrative panel for platform management
- **`backend/`** - Express.js API server with PostgreSQL database

### Shared Libraries

- **`lib.components/`** - Reusable React component library with TypeScript and styled-components

### Documentation & Scripts

- **`docs/`** - Technical documentation and guides
- **`scripts/`** - Development and migration scripts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker (optional, for containerized development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pairflix
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Using Docker (recommended)
   docker-compose up -d postgres

   # Or install PostgreSQL locally and create a database
   createdb pairflix_development
   ```

4. **Configure environment variables**

   ```bash
   # Copy example environment files
   cp backend/.env.example backend/.env
   cp app.client/.env.example app.client/.env

   # Edit the files with your configuration
   ```

5. **Start the development servers**

   ```bash
   # Start all services
   npm run dev

   # Or start individually
   npm run dev:backend    # API server (port 3000)
   npm run dev:client     # Client app (port 5173)
   npm run dev:admin      # Admin panel (port 5174)
   ```

## 📱 Applications

### Main Application (Client)

The primary user interface where users can:

- Browse and search movies/TV shows using TMDB API
- Create and manage personal watchlists
- Rate and review content
- Find viewing partners with similar interests
- View activity feeds and recommendations

**Access:** http://localhost:5173

### Admin Panel

Administrative interface for platform management:

- User management and moderation
- Content management and reporting
- System monitoring and analytics
- Application settings and configuration

**Access:** http://localhost:5174

### Backend API

RESTful API server providing:

- User authentication and authorization
- Watchlist and rating management
- Matching algorithm for finding viewing partners
- TMDB integration for movie/TV data
- Comprehensive audit logging
- Rate limiting and security features

**API Base:** http://localhost:3000/api

## 🛠️ Development

### Available Scripts

**Root Level:**

- `npm run dev` - Start all development servers
- `npm run build` - Build all applications for production
- `npm run test` - Run all test suites
- `npm run lint` - Lint all projects
- `npm run format` - Format code using Prettier

**Individual Applications:**

- `npm run dev:backend` - Start backend API server
- `npm run dev:client` - Start client development server
- `npm run dev:admin` - Start admin panel development server
- `npm run dev:components` - Start component library Storybook

### Technology Stack

**Frontend:**

- React 18+ with TypeScript
- Vite for build tooling
- React Router for navigation
- React Query for API state management
- styled-components for styling

**Backend:**

- Node.js with Express.js
- TypeScript for type safety
- PostgreSQL with Sequelize ORM
- JWT authentication
- Rate limiting with express-rate-limit
- Comprehensive error handling and logging

**Testing:**

- Jest for unit testing
- React Testing Library for component testing
- Supertest for API testing

**Development Tools:**

- ESLint for code linting
- Prettier for code formatting
- Husky for Git hooks
- lint-staged for pre-commit checks

## 🔒 Security Features

- **Rate Limiting**: Comprehensive rate limiting to prevent DoS attacks
- **Authentication**: JWT-based user authentication
- **Authorization**: Role-based access control (User/Admin)
- **Input Validation**: Request validation and sanitization
- **CORS**: Configurable CORS policies
- **Audit Logging**: Comprehensive activity and security logging

## 📊 Database

PostgreSQL database with comprehensive schema including:

- User management and preferences
- Content and watchlist management
- Matching and recommendation engine
- Audit logging and activity tracking
- Application settings and configuration

See [`db-schema.md`](./db-schema.md) for detailed schema documentation.

## 🧪 Testing

Comprehensive testing strategy covering:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and service testing
- **Component Tests**: React component behavior testing
- **E2E Tests**: Full application workflow testing

Run tests:

```bash
npm run test              # All tests
npm run test:backend      # Backend tests only
npm run test:client       # Client tests only
npm run test:components   # Component library tests
```

## 📚 Documentation

### 📖 Start Here

- **[📚 Documentation Index](./docs/README.md)** - Complete documentation catalog organized by audience and topic
- **[🚀 Development Setup](./docs/dev-setup.md)** - Quick start guide for local development
- **[🏗️ Architecture Overview](./docs/architecture.md)** - System design and technical architecture

### 🎯 Application Documentation

- **[Backend API](./backend/README.md)** - Node.js/Express API server with comprehensive security features
- **[Main Application](./app.client/README.md)** - React client application for end users
- **[Admin Panel](./app.admin/README.md)** - Administrative interface and system management
- **[Component Library](./lib.components/README.md)** - Shared UI component system and design standards

### 📚 Technical References

- **[API Documentation](./docs/api-docs.md)** - Complete REST API reference with examples
- **[Database Schema](./docs/db-schema.md)** - Database design and relationships
- **[Security Guide](./backend/docs/SECURITY.md)** - Security implementation, rate limiting, and best practices
- **[Decision Log](./docs/decision-log.md)** - Comprehensive record of architectural and implementation decisions

> 💡 **For complete documentation navigation, visit the [Documentation Index](./docs/README.md)**

## 🚀 Deployment

### Development

```bash
npm run dev  # Start all development servers
```

### Production Build

```bash
npm run build  # Build all applications
```

### Docker Deployment

```bash
docker-compose up -d  # Start all services with Docker
```

See [`prd.md`](./prd.md) for detailed production deployment instructions.

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the coding standards
4. **Run tests** (`npm run test`)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all linting passes
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Check the `/docs` directory for detailed guides
- **Development**: See individual application READMEs for specific setup instructions

---

**Built with ❤️ for movie and TV enthusiasts**
