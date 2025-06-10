# 🏗️ Architecture Documentation

## System Overview

PairFlix follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐       ┌────────────────┐      ┌────────────────┐
│                 │       │                │      │                │
│  Client & Admin ├───────►  Express API   ├──────►  PostgreSQL    │
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

## Client Architecture

The React-based client applications follow a feature-based architecture that organizes code by domain rather than by technical concerns:

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

The application implements a comprehensive activity tracking system that monitors and analyzes user behavior with sophisticated filtering for social feeds:

### Components

- **ActivityLog Model**: Stores structured activity data with contextual information
- **ActivityType Enum**: Standardized activity types for consistency across the application
- **Activity Service**: Core service for logging and retrieving activity data with social filtering
- **Analytics Functions**: Advanced analytics to derive insights from user activity
- **Admin Dashboard**: Visualization and reporting of activity patterns
- **Social Activity Feed**: User-focused activity streams with partner matching

### Activity Tracking Flow

1. User performs an action (e.g., adds a movie to watchlist)
2. Action is processed by the appropriate controller
3. Controller calls the activity service to log the action
4. Activity is stored with context, metadata, and security information
5. Analytics functions process activity data for insights
6. Admin dashboard displays activity trends and patterns
7. Social feeds provide filtered, partner-based activity streams

### Activity Categories

Activities are organized into contextual categories:

- **Watchlist**: Adding, updating, rating, or removing watchlist items
- **User**: Login, logout, profile updates, preference changes
- **Match**: Creating, viewing, accepting, or declining matches
- **Search**: Media searches with filters
- **Media**: Viewing media details, trailers, etc.
- **System**: Notification interactions, feature usage

### Social Activity Filtering

The activity system implements intelligent filtering for user-facing feeds:

#### Social Activities (Included in User Feeds)

- `WATCHLIST_ADD`, `WATCHLIST_UPDATE`, `WATCHLIST_REMOVE`, `WATCHLIST_RATE`
- `MATCH_ACCEPTED`, `MATCH_CREATE`
- Other socially relevant activities

#### System Activities (Excluded from User Feeds)

- `USER_LOGIN`, `USER_LOGOUT`, `USER_PASSWORD_CHANGE`
- `USER_PROFILE_UPDATE`, `USER_PREFERENCES_UPDATE`
- `MEDIA_SEARCH`, `MEDIA_VIEW`
- Other system/privacy-related activities

### Partner-Based Activity Streams

The system provides three distinct activity endpoints:

1. **User Activities** (`/api/activity/me`): User's own activities only
2. **Partner Activities** (`/api/activity/partner`): Activities from accepted match partners only
3. **Social Feed** (`/api/activity/feed`): Combined social activities from user + partners

Partner filtering uses the Match model to identify accepted partnerships:

- Queries for matches with `status: 'accepted'`
- Includes activities from both `user1_id` and `user2_id` relationships
- Maintains privacy by excluding non-matched users

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

## Settings Management System

The application implements a centralized settings management system that provides consistent configuration across the application:

### Components

- **AppSettings Model**: Database table storing application-wide settings as key-value pairs
- **Settings Service**: Core service for retrieving and updating application settings
- **Environment Variable Integration**: Security-focused approach for sensitive settings
- **Admin Dashboard**: Interface for adjusting application settings
- **Client Settings Integration**: Client app consumes admin-configured settings

### Settings Architecture

1. **Database Storage**: Core settings are persisted in the database using JSONB
2. **Memory Cache**: Settings are cached in-memory with TTL to reduce database load
3. **Environment Override**: Environment variables can override database settings
4. **Sensitive Data Handling**: Sensitive fields (passwords, API keys) are never stored in DB
5. **Cross-App Integration**: Client app loads settings via admin API

### Settings Organization

Settings are organized into logical sections:

- **General**: Basic application information and configuration
- **Security**: Password policies, session timeouts, and authentication rules
- **Email**: SMTP configuration for transactional emails
- **Media**: File upload rules and content management settings
- **Features**: Feature flags for enabling/disabling application capabilities

### Admin-Client Settings Flow

1. Administrators configure application settings through the admin interface
2. Settings are saved to the database via the admin API
3. Client application fetches these settings on initialization
4. Client maps the full admin settings to its simplified structure
5. Default fallback values are used if API fetch fails
6. Settings are refreshable via the provided context API

### Environment Configuration

The settings system supports different environments:

- **Development**: Default settings with easy override via .env file
- **Testing**: Static settings for consistent test execution
- **Production**: Environment variable overrides for secure deployment

### Security Approach

- Sensitive data like SMTP passwords are stored as empty placeholders in database
- Runtime environment variables provide actual sensitive values
- Settings changes are audit-logged for security tracking
- Role-based access control limits settings modifications
