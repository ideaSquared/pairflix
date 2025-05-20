# 🏗️ Architecture Documentation

## System Overview

PairFlix follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐       ┌────────────────┐      ┌────────────────┐
│                 │       │                │      │                │
│  React Frontend ├───────►  Express API   ├──────►  PostgreSQL    │
│  (TypeScript)   │◄───────┤  (TypeScript) │◄──────┤  Database     │
│                 │       │                │      │                │
└────────┬────────┘       └────────┬───────┘      └────────────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌────────────────┐
│  Browser/Client │       │    TMDb API    │
│  (User's Device)│       │  (External)    │
└─────────────────┘       └────────────────┘
```

## Frontend Architecture

The React frontend follows a feature-based architecture that organizes code by domain rather than by technical concerns:

### Key Components

- **Feature Modules**: Self-contained feature areas (auth, watchlist, match)
- **Component Library**: Reusable UI components
- **Services Layer**: API communication and data transformation
- **Hooks**: Custom React hooks for shared logic
- **Global State**: Authentication state and user context

### Data Flow

1. User interacts with a component
2. Component calls a service function
3. Service makes an API request
4. Response is transformed and returned to component
5. Component updates its state and re-renders

## Backend Architecture

The Express backend is structured in layers to maintain separation of concerns and facilitate testing:

### Key Components

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define database schemas and relationships
- **Routes**: Define API endpoints
- **Middlewares**: Process requests (authentication, validation)

### Request Flow

1. Request hits a route
2. Authentication middleware validates JWT
3. Controller processes the request
4. Service performs business logic
5. Model interacts with database
6. Response flows back through layers

## Database Architecture

PostgreSQL database with a normalized schema:

### Key Entities

- **Users**: Account information and authentication
- **WatchlistEntries**: User's watchlist items with status and ratings
- **Tags**: Categorization system for watchlist entries
- **Matches**: Derived data showing overlapping watchlist items
- **ActivityLog**: Enhanced tracking of user actions with contextual data

## Activity Tracking System

The application implements a comprehensive activity tracking system that monitors and analyzes user behavior:

### Components

- **ActivityLog Model**: Stores structured activity data with contextual information
- **ActivityType Enum**: Standardized activity types for consistency across the application
- **Activity Service**: Core service for logging and retrieving activity data
- **Analytics Functions**: Advanced analytics to derive insights from user activity
- **Admin Dashboard**: Visualization and reporting of activity patterns

### Activity Tracking Flow

1. User performs an action (e.g., adds a movie to watchlist)
2. Action is processed by the appropriate controller
3. Controller calls the activity service to log the action
4. Activity is stored with context, metadata, and security information
5. Analytics functions process activity data for insights
6. Admin dashboard displays activity trends and patterns

### Activity Categories

Activities are organized into contextual categories:

- **Watchlist**: Adding, updating, rating, or removing watchlist items
- **User**: Login, logout, profile updates, preference changes
- **Match**: Creating, viewing, accepting, or declining matches
- **Search**: Media searches with filters
- **Media**: Viewing media details, trailers, etc.
- **System**: Notification interactions, feature usage

### Security Tracking

The activity system captures security-relevant data:

- IP addresses for geographic and device tracking
- User agent strings for browser/device identification
- Timestamps for temporal pattern analysis

## External Dependencies

- **TMDb API**: Provides movie and TV show metadata
- **JWT**: Handles authentication tokens
- **bcrypt**: Manages password hashing

## Security Architecture

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- HTTPS for all API communication
- Input validation on all endpoints
- Rate limiting to prevent abuse
- Activity tracking for security monitoring

## Caching Strategy

- Client-side caching of TMDb responses
- Minimized duplicate requests to external APIs
- Local storage for non-sensitive user preferences

## Error Handling

- Centralized error handling middleware
- Client-side error boundaries
- Consistent error response format

## Deployment Architecture

Docker-based deployment with:

- Multi-stage builds for optimized images
- Separate containers for frontend, backend, and database
- Environment-specific configuration via Docker Compose
- Volume mapping for database persistence
