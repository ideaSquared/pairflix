# 📘 API Documentation

This document provides details about all the APIs in the Pairflix application. Use this documentation as a reference when developing frontend components or integrating with the backend.

## Overview

The PairFlix API follows RESTful principles and uses JWT for authentication. All endpoints return JSON responses and expect JSON in request bodies where applicable.

## Base URL

```
/api/v1
```

## Authentication

Most endpoints require authentication via a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Token Storage

- Client app stores user tokens with key `token`
- Admin app stores admin tokens with key `admin_token` for better security isolation

## Authentication Endpoints

#### POST /api/auth/register

Creates a new user account and returns a JWT token for automatic login.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Response: 201 Created**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "user",
    "status": "active",
    "preferences": {
      "theme": "dark",
      "viewStyle": "grid",
      "emailNotifications": true,
      "autoArchiveDays": 30,
      "favoriteGenres": []
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Validation errors (missing fields, invalid email/username format, weak password)
- `409 Conflict`: Email or username already exists

#### POST /api/auth/login

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response: 200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET /api/auth/me

Returns the current authenticated user.

**Response: 200 OK**

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "username": "johndoe",
  "role": "user",
  "preferences": {
    "theme": "dark",
    "viewStyle": "grid",
    "emailNotifications": true,
    "autoArchiveDays": 30,
    "favoriteGenres": ["action", "comedy"]
  }
}
```

#### POST /api/auth/logout

Logs out the current user.

**Response: 204 No Content**

#### POST /api/auth/admin/login

Authenticates an admin user and returns a JWT token.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "admin_password"
}
```

**Response: 200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@example.com",
    "username": "admin",
    "role": "admin"
  }
}
```

#### GET /api/auth/admin/me

Returns the current authenticated admin user.

**Response: 200 OK**

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@example.com",
  "username": "admin",
  "role": "admin",
  "last_login": "2025-06-03T10:30:00.000Z"
}
```

#### POST /api/auth/admin/logout

Logs out the current admin user.

**Response: 204 No Content**

## User Endpoints

#### GET /api/user/profile

Returns the profile of the current authenticated user.

**Response: 200 OK**

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "username": "johndoe",
  "preferences": {
    "theme": "dark",
    "viewStyle": "grid",
    "emailNotifications": true,
    "autoArchiveDays": 30,
    "favoriteGenres": ["action", "comedy"]
  }
}
```

#### PATCH /api/user/profile

Updates the profile of the current authenticated user.

**Request Body:**

```json
{
  "username": "newusername"
}
```

**Response: 200 OK**

```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "username": "newusername",
  "preferences": {
    "theme": "dark",
    "viewStyle": "grid",
    "emailNotifications": true,
    "autoArchiveDays": 30,
    "favoriteGenres": ["action", "comedy"]
  }
}
```

#### PUT /api/user/password

Updates the password of the current authenticated user.

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response: 200 OK**

```json
{
  "message": "Password updated successfully"
}
```

#### PUT /api/user/email

Updates the email of the current authenticated user.

**Request Body:**

```json
{
  "email": "newemail@example.com",
  "password": "currentpassword123"
}
```

**Response: 200 OK**

```json
{
  "message": "Email updated successfully",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "newemail@example.com",
    "username": "johndoe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### PUT /api/user/username

Updates the username of the current authenticated user.

**Request Body:**

```json
{
  "username": "newusername"
}
```

**Response: 200 OK**

```json
{
  "message": "Username updated successfully",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "newusername"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### PUT /api/user/preferences

Updates the preferences of the current authenticated user.

**Request Body:**

```json
{
  "preferences": {
    "theme": "light",
    "viewStyle": "list",
    "emailNotifications": false,
    "autoArchiveDays": 15,
    "favoriteGenres": ["action", "comedy"]
  }
}
```

**Response: 200 OK**

```json
{
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "username": "johndoe",
    "preferences": {
      "theme": "light",
      "viewStyle": "list",
      "emailNotifications": false,
      "autoArchiveDays": 15,
      "favoriteGenres": ["action", "comedy"]
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Admin Endpoints

These endpoints are only accessible to users with admin role.

### User Management

#### GET /api/admin/users

Returns a paginated list of users with optional filtering and sorting.

**Query Parameters:**

- `limit` (optional): Number of users per page (default: 10)
- `offset` (optional): Starting position for pagination
- `search` (optional): Search by username or email
- `role` (optional): Filter by role (`admin`, `moderator`, `user`)
- `status` (optional): Filter by status (`active`, `inactive`, `pending`, `suspended`)
- `sortBy` (optional): Sort field (`username`, `email`, `created_at`, `last_login`)
- `sortOrder` (optional): Sort direction (`asc`, `desc`)

**Response: 200 OK**

```json
{
  "users": [
    {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "created_at": "2023-01-01T00:00:00.000Z",
      "last_login": "2023-01-02T00:00:00.000Z",
      "preferences": {
        "theme": "dark",
        "emailNotifications": true
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST /api/admin/users

Creates a new user.

**Request Body:**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "status": "active"
}
```

**Response: 201 Created**

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user",
    "status": "active",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/admin/users/:userId

Returns details for a specific user.

**Response: 200 OK**

```json
{
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_login": "2023-01-02T00:00:00.000Z",
    "preferences": {
      "theme": "dark",
      "emailNotifications": true
    }
  }
}
```

#### PUT /api/admin/users/:userId

Updates a user's details.

**Request Body:**

```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "moderator",
  "status": "suspended"
}
```

**Response: 200 OK**

```json
{
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "newusername",
    "email": "newemail@example.com",
    "role": "moderator",
    "status": "suspended",
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_login": "2023-01-02T00:00:00.000Z"
  },
  "message": "User updated successfully"
}
```

#### PUT /api/admin/users/:userId/status

Changes a user's status.

**Request Body:**

```json
{
  "status": "suspended",
  "reason": "Violation of community guidelines"
}
```

**Response: 200 OK**

```json
{
  "success": true,
  "message": "User status changed to suspended successfully",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "username",
    "email": "user@example.com",
    "role": "user",
    "status": "suspended",
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_login": "2023-01-02T00:00:00.000Z"
  }
}
```

#### POST /api/admin/users/:userId/reset-password

Resets a user's password.

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Password reset successful",
  "newPassword": "ab12cd34",
  "user": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "username",
    "email": "user@example.com"
  }
}
```

#### GET /api/admin/users-csv

Exports users as CSV.

**Query Parameters:**

- `role` (optional): Filter by role (`admin`, `moderator`, `user`)
- `status` (optional): Filter by status (`active`, `inactive`, `pending`, `suspended`)

**Response: 200 OK**
Content-Type: text/csv
Content-Disposition: attachment; filename=users.csv

```
User ID,Username,Email,Status,Role,Created At,Last Login
123e4567-e89b-12d3-a456-426614174000,admin,admin@example.com,active,admin,2023-01-01T00:00:00.000Z,2023-01-02T00:00:00.000Z
```

#### DELETE /api/admin/users/:userId

Deletes a user.

**Response: 200 OK**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Content Moderation

#### GET /api/admin/watchlist-entries

Returns all watchlist entries across all users.

**Query Parameters:**

- `limit` (optional): Number of entries per page (default: 10)
- `offset` (optional): Starting position for pagination
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by status
- `mediaType` (optional): Filter by media type (`movie`, `tv`)

**Response: 200 OK**

```json
{
  "entries": [
    {
      "entry_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "tmdb_id": 12345,
      "media_type": "movie",
      "status": "to_watch",
      "notes": "Recommended by friend",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "title": "Movie Title",
      "overview": "Movie description",
      "poster_path": "/path/to/poster.jpg",
      "User": {
        "username": "johndoe",
        "email": "user@example.com"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### PUT /api/admin/watchlist-entries/:entryId/moderate

Moderates a watchlist entry.

**Request Body:**

```json
{
  "action": "flag",
  "reason": "Inappropriate content"
}
```

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Watchlist entry flagged successfully",
  "entry": {
    "entry_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "tmdb_id": 12345,
    "media_type": "movie",
    "status": "flagged",
    "notes": "Inappropriate content",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-02T00:00:00.000Z"
  }
}
```

### System Monitoring

#### GET /api/admin/system-metrics

Returns system metrics.

**Response: 200 OK**

```json
{
  "metrics": {
    "users": {
      "total": 100,
      "active": 80,
      "inactivePercentage": 20
    },
    "content": {
      "watchlistEntries": 500,
      "matches": 150
    },
    "activity": {
      "last24Hours": 100,
      "lastWeek": 500
    },
    "system": {
      "recentErrors": 5,
      "uptime": 86400,
      "memoryUsage": {
        "rss": 50000000,
        "heapTotal": 30000000,
        "heapUsed": 20000000,
        "external": 10000000
      },
      "timestamp": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /api/admin/user-activity-stats

Returns user activity statistics.

**Query Parameters:**

- `days` (optional): Number of days to include (default: 7, max: 90)

**Response: 200 OK**

```json
{
  "timespan": {
    "days": 7,
    "startDate": "2023-01-01T00:00:00.000Z"
  },
  "activityByDate": [
    {
      "date": "2023-01-01",
      "count": 50
    }
  ],
  "activityByType": [
    {
      "action": "WATCHLIST_ADD",
      "count": 30
    }
  ],
  "mostActiveUsers": [
    {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "count": 20,
      "User": {
        "username": "johndoe",
        "email": "user@example.com"
      }
    }
  ]
}
```

### Audit Logs

#### GET /api/admin/audit-logs

Returns all audit logs.

**Query Parameters:**

- `limit` (optional): Number of logs per page (default: 100)
- `offset` (optional): Starting position for pagination
- `source` (optional): Filter by source
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response: 200 OK**

```json
{
  "logs": [
    {
      "log_id": "123e4567-e89b-12d3-a456-426614174000",
      "level": "info",
      "message": "User login",
      "source": "auth-controller",
      "context": {
        "userId": "123e4567-e89b-12d3-a456-426614174000",
        "timestamp": "2023-01-01T00:00:00.000Z"
      },
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 500,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/admin/audit-logs/:level

Returns audit logs filtered by level.

**Path Parameters:**

- `level` (required): Log level (`info`, `warn`, `error`, `debug`)

**Query Parameters:**

- `limit` (optional): Number of logs per page (default: 100)
- `offset` (optional): Starting position for pagination
- `source` (optional): Filter by source
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response: 200 OK**

```json
{
  "logs": [
    {
      "log_id": "123e4567-e89b-12d3-a456-426614174000",
      "level": "info",
      "message": "User login",
      "source": "auth-controller",
      "context": {
        "userId": "123e4567-e89b-12d3-a456-426614174000",
        "timestamp": "2023-01-01T00:00:00.000Z"
      },
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 300,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/admin/audit-logs-sources

Returns all unique log sources.

**Response: 200 OK**

```json
{
  "sources": ["auth-controller", "user-controller", "admin-controller"]
}
```

#### GET /api/admin/audit-logs-stats

Returns audit log statistics.

**Response: 200 OK**

```json
{
  "stats": {
    "total": 500,
    "byLevel": {
      "info": 300,
      "warn": 150,
      "error": 50
    },
    "oldestLog": "2023-01-01T00:00:00.000Z",
    "newestLog": "2023-01-10T00:00:00.000Z"
  }
}
```

#### POST /api/admin/audit-logs-rotation

Manually runs log rotation.

**Request Body:**

```json
{
  "retentionDays": {
    "info": 30,
    "warn": 60,
    "error": 90,
    "debug": 7
  }
}
```

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Log rotation complete. Removed 100 old logs."
}
```

### Activity Analytics

#### GET /api/admin/all-activities

Returns activities across all users with optional filtering.

**Query Parameters:**

- `limit` (optional): Number of activities per page (default: 20)
- `offset` (optional): Starting position for pagination
- `action` (optional): Filter by action type
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)

**Response: 200 OK**

```json
{
  "activities": [
    {
      "log_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "action": "WATCHLIST_ADD",
      "context": "watchlist",
      "metadata": {
        "mediaId": 12345,
        "mediaType": "movie",
        "title": "The Matrix"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2023-01-02T00:00:00.000Z",
      "user": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "johndoe",
        "email": "user@example.com"
      }
    }
  ],
  "pagination": {
    "total": 500,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/admin/activity-analytics

Returns comprehensive activity analytics for admin dashboard.

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30)
- `startDate` (optional): Custom start date (ISO format)
- `endDate` (optional): Custom end date (ISO format)
- `groupBy` (optional): Group time data by 'day', 'week', or 'month' (default: 'day')

**Response: 200 OK**

```json
{
  "timeRange": {
    "days": 30,
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2023-01-30T23:59:59.999Z"
  },
  "popularActivities": [
    {
      "action": "WATCHLIST_ADD",
      "count": 150
    },
    {
      "action": "USER_LOGIN",
      "count": 120
    }
  ],
  "timeline": [
    {
      "date": "2023-01-01",
      "count": 50
    },
    {
      "date": "2023-01-02",
      "count": 45
    }
  ],
  "contextStats": [
    {
      "label": "watchlist",
      "count": 200
    },
    {
      "label": "user",
      "count": 150
    }
  ],
  "actionStats": [
    {
      "label": "WATCHLIST_ADD",
      "count": 150
    },
    {
      "label": "WATCHLIST_REMOVE",
      "count": 30
    }
  ],
  "userPatterns": [
    {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "johndoe",
      "mostFrequentActivity": "WATCHLIST_ADD",
      "mostActiveTime": "20",
      "activityCount": 45
    }
  ]
}
```

#### GET /api/admin/activities/context/:context

Returns activities filtered by context category.

**Path Parameters:**

- `context` (required): Activity context ('watchlist', 'user', 'match', 'search', 'media', 'system')

**Query Parameters:**

- `action` (optional): Filter by specific action type
- `limit` (optional): Number of activities per page (default: 20)
- `offset` (optional): Starting position for pagination

**Response: 200 OK**

```json
{
  "activities": [
    {
      "log_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "action": "WATCHLIST_ADD",
      "context": "watchlist",
      "metadata": {
        "mediaId": 12345,
        "mediaType": "movie",
        "title": "The Matrix"
      },
      "created_at": "2023-01-02T00:00:00.000Z",
      "user": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "johndoe",
        "email": "user@example.com"
      }
    }
  ],
  "pagination": {
    "total": 200,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/admin/user/:userId/activity-patterns

Returns detailed activity patterns for a specific user.

**Path Parameters:**

- `userId` (required): The user ID to analyze

**Query Parameters:**

- `days` (optional): Number of days to include (default: 30)

**Response: 200 OK**

```json
{
  "patterns": [
    {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "johndoe",
      "mostFrequentActivity": "WATCHLIST_ADD",
      "mostActiveTime": "20",
      "activityCount": 45,
      "activityBreakdown": {
        "WATCHLIST_ADD": 20,
        "WATCHLIST_RATE": 10,
        "USER_LOGIN": 15
      },
      "timeDistribution": {
        "morning": 10,
        "afternoon": 15,
        "evening": 20
      }
    }
  ]
}
```

## Watchlist Endpoints

#### GET /api/watchlist

Returns the watchlist of the current authenticated user.

**Response: 200 OK**

```json
{
  "entries": [
    {
      "entry_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "tmdb_id": 12345,
      "media_type": "movie",
      "status": "to_watch",
      "notes": "Recommended by friend",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "title": "Movie Title",
      "overview": "Movie description",
      "poster_path": "/path/to/poster.jpg"
    }
  ]
}
```

#### POST /api/watchlist

Adds a new entry to the watchlist.

**Request Body:**

```json
{
  "tmdb_id": 12345,
  "media_type": "movie",
  "status": "to_watch"
}
```

**Response: 201 Created**

```json
{
  "entry": {
    "entry_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "tmdb_id": 12345,
    "media_type": "movie",
    "status": "to_watch",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z",
    "title": "Movie Title",
    "overview": "Movie description",
    "poster_path": "/path/to/poster.jpg"
  }
}
```

#### PUT /api/watchlist/:entryId

Updates a watchlist entry.

**Request Body:**

```json
{
  "status": "watching",
  "notes": "Currently watching, enjoying so far"
}
```

**Response: 200 OK**

```json
{
  "entry": {
    "entry_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "tmdb_id": 12345,
    "media_type": "movie",
    "status": "watching",
    "notes": "Currently watching, enjoying so far",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-02T00:00:00.000Z",
    "title": "Movie Title",
    "overview": "Movie description",
    "poster_path": "/path/to/poster.jpg"
  }
}
```

#### DELETE /api/watchlist/:entryId

Deletes a watchlist entry.

**Response: 204 No Content**

## Activity Feed Endpoints

### User Activity Feed

#### GET /api/activity/me

Returns the authenticated user's activity feed.

**Response: 200 OK**

```json
{
  "activities": [
    {
      "log_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "action": "WATCHLIST_ADD",
      "context": "watchlist",
      "metadata": {
        "mediaId": 12345,
        "mediaType": "movie",
        "title": "The Matrix"
      },
      "created_at": "2023-01-02T00:00:00.000Z",
      "user": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "johndoe"
      }
    }
  ]
}
```

#### GET /api/activity/partner

Returns activity from matched partners only.

**Response: 200 OK**

```json
{
  "activities": [
    {
      "log_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "456e7890-e89b-12d3-a456-426614174000",
      "action": "WATCHLIST_RATE",
      "context": "watchlist",
      "metadata": {
        "mediaId": 12345,
        "mediaType": "movie",
        "title": "The Matrix",
        "rating": 5
      },
      "created_at": "2023-01-02T00:00:00.000Z",
      "user": {
        "user_id": "456e7890-e89b-12d3-a456-426614174000",
        "username": "janedoe"
      }
    }
  ]
}
```

#### GET /api/activity/feed

Returns a social activity feed containing user's activities and matched partners' activities. Only includes socially relevant activities (excludes login events, searches, password changes, etc.).

**Response: 200 OK**

```json
{
  "activities": [
    {
      "log_id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "action": "WATCHLIST_ADD",
      "context": "watchlist",
      "metadata": {
        "mediaId": 12345,
        "mediaType": "movie",
        "title": "The Matrix"
      },
      "created_at": "2023-01-02T00:00:00.000Z",
      "user": {
        "user_id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "johndoe"
      }
    },
    {
      "log_id": "456e7890-e89b-12d3-a456-426614174000",
      "user_id": "456e7890-e89b-12d3-a456-426614174000",
      "action": "MATCH_ACCEPTED",
      "context": "match",
      "metadata": {
        "partnerId": "123e4567-e89b-12d3-a456-426614174000",
        "partnerUsername": "johndoe"
      },
      "created_at": "2023-01-01T00:00:00.000Z",
      "user": {
        "user_id": "456e7890-e89b-12d3-a456-426614174000",
        "username": "janedoe"
      }
    }
  ]
}
```

**Note:** The activity feed filters to show only social activities including:

- Watchlist actions (add, update, remove, rate)
- Match activities (create, accept)
- Other socially relevant activities

System activities like login events, searches, password changes, and profile updates are excluded from the social feed.

## Search Endpoints

#### GET /api/search/media

Searches for movies and TV shows.

**Query Parameters:**

- `query` (required): The search term

**Response: 200 OK**

```json
{
  "page": 1,
  "results": [
    {
      "id": 12345,
      "title": "Movie Title",
      "media_type": "movie",
      "poster_path": "/path/to/poster.jpg",
      "overview": "Movie description"
    }
  ],
  "total_pages": 10,
  "total_results": 100
}
```

## Match Endpoints

#### GET /match

Returns watchlist entries that both users have in common.

**Query Parameters:**

- `status` (optional): Filter by status
- `sort` (optional): Sort field
- `order` (optional): Sort order

**Response: 200 OK**

```json
{
  "matches": [
    {
      "tmdbId": 550,
      "mediaType": "movie",
      "title": "Fight Club",
      "posterPath": "/path/to/poster.jpg",
      "user1": {
        "status": "to_watch",
        "rating": null
      },
      "user2": {
        "status": "to_watch",
        "rating": null
      }
    }
  ],
  "total": 1
}
```

#### GET /match/recommendations

Returns content recommendations based on both users' preferences.

**Response: 200 OK**

```json
{
  "recommendations": [
    {
      "id": 550,
      "title": "Fight Club",
      "mediaType": "movie",
      "releaseDate": "1999-10-15",
      "posterPath": "/path/to/poster.jpg",
      "overview": "An insomniac office worker and a devil-may-care soapmaker form an underground fight club...",
      "matchScore": 0.85
    }
  ],
  "total": 1
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": {
    "field": "Description of the error"
  }
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute per IP address
- 1000 requests per day per user

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```

## Settings Management

#### GET /api/admin/settings

Returns all application settings. Requires valid admin authentication.

**Query Parameters:**

- `forceRefresh` (optional): Boolean to force refresh from database even if cache is valid

**Response: 200 OK**

```json
{
  "general": {
    "siteName": "PairFlix",
    "siteDescription": "Find your perfect movie match",
    "maintenanceMode": false,
    "defaultUserRole": "user"
  },
  "security": {
    "sessionTimeout": 120,
    "maxLoginAttempts": 5,
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSpecialChars": false
    },
    "twoFactorAuth": {
      "enabled": false,
      "requiredForAdmins": false
    }
  },
  "email": {
    "smtpServer": "smtp.example.com",
    "smtpPort": 587,
    "smtpUsername": "notifications@pairflix.com",
    "senderEmail": "notifications@pairflix.com",
    "senderName": "PairFlix Notifications",
    "emailTemplatesPath": "/templates/email"
  },
  "media": {
    "maxUploadSize": 5,
    "allowedFileTypes": ["jpg", "jpeg", "png", "gif"],
    "imageQuality": 85,
    "storageProvider": "local"
  },
  "features": {
    "enableMatching": true,
    "enableUserProfiles": true,
    "enableNotifications": true,
    "enableActivityFeed": true
  }
}
```

**Note:** Settings are cached and only loaded when a valid authentication token is present. The API will avoid making unnecessary database calls for unauthenticated users.

#### GET /api/admin/settings/:key

Returns a specific setting by key.

**Path Parameters:**

- `key` (required): The setting key to retrieve (e.g., "general.siteName")

**Response: 200 OK**

```json
{
  "key": "general.siteName",
  "value": "PairFlix",
  "category": "general",
  "description": "Name of the application shown to users"
}
```

#### PUT /api/admin/settings/:key

Updates a specific setting.

**Path Parameters:**

- `key` (required): The setting key to update

**Request Body:**

```json
{
  "value": "New Site Name",
  "category": "general",
  "description": "Name of the application shown to users"
}
```

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Setting updated successfully",
  "setting": {
    "key": "general.siteName",
    "value": "New Site Name",
    "category": "general",
    "description": "Name of the application shown to users",
    "updated_at": "2025-05-23T12:00:00.000Z"
  }
}
```

#### PUT /api/admin/settings

Updates multiple settings at once.

**Request Body:**

```json
{
  "general.siteName": "New Site Name",
  "general.maintenanceMode": true,
  "features.enableMatching": false
}
```

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Settings updated successfully",
  "updatedCount": 3
}
```

#### DELETE /api/admin/settings/:key

Deletes a specific setting.

**Path Parameters:**

- `key` (required): The setting key to delete

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Setting deleted successfully"
}
```

#### POST /api/admin/settings/reset

Resets all settings to default values.

**Response: 200 OK**

```json
{
  "success": true,
  "message": "All settings reset to default values",
  "settingsCount": 25
}
```

#### POST /api/admin/settings/validate

Validates the current settings configuration.

**Response: 200 OK**

```json
{
  "success": true,
  "message": "Settings configuration validated successfully",
  "issues": []
}
```

**Response: 400 Bad Request** (if validation issues found)

```json
{
  "success": false,
  "message": "Settings configuration has issues",
  "issues": [
    {
      "key": "email.smtpPort",
      "message": "SMTP port must be a number between 1-65535"
    }
  ]
}
```

#### GET /api/admin/client-settings

Returns a simplified subset of settings intended for client application use.

**Response: 200 OK**

```json
{
  "siteName": "PairFlix",
  "theme": {
    "primaryColor": "#1976d2",
    "secondaryColor": "#dc004e",
    "darkMode": true
  },
  "features": {
    "enableNotifications": true,
    "enableActivityFeed": true
  }
}
```
