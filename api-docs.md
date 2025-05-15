# 📘 API Documentation

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

### Authentication Endpoints

#### POST /auth/login

Authenticates a user and returns tokens.

**Request Body:**

```json
{
	"email": "user@example.com",
	"password": "securepassword"
}
```

**Response: 200 OK**

```json
{
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"user": {
		"id": "123e4567-e89b-12d3-a456-426614174000",
		"username": "user1",
		"email": "user@example.com"
	}
}
```

#### POST /auth/refresh

Refreshes an expired access token.

**Request Body:**

```json
{
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response: 200 OK**

```json
{
	"accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout

Invalidates a refresh token.

**Request Body:**

```json
{
	"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response: 204 No Content**

## User Endpoints

#### GET /user/profile

Returns the current user's profile.

**Response: 200 OK**

```json
{
	"id": "123e4567-e89b-12d3-a456-426614174000",
	"username": "user1",
	"email": "user@example.com",
	"createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### PATCH /user/profile

Updates the current user's profile.

**Request Body:**

```json
{
	"username": "newusername",
	"email": "newemail@example.com"
}
```

**Response: 200 OK**

```json
{
	"id": "123e4567-e89b-12d3-a456-426614174000",
	"username": "newusername",
	"email": "newemail@example.com",
	"updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### PUT /user/password

Changes the current user's password.

**Request Body:**

```json
{
	"currentPassword": "oldsecurepassword",
	"newPassword": "newsecurepassword"
}
```

**Response: 204 No Content**

## Admin Endpoints

These endpoints are only accessible to users with admin role.

### User Management

#### GET /admin/users

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

#### GET /admin/users/:userId

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

#### PUT /admin/users/:userId

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

#### DELETE /admin/users/:userId

Deletes a user.

**Response: 200 OK**

```json
{
	"success": true,
	"message": "User deleted successfully"
}
```

## Watchlist Endpoints

#### GET /watchlist

Returns the current user's watchlist entries.

**Query Parameters:**

- `status` (optional): Filter by status (`to_watch`, `watching`, `finished`)
- `sort` (optional): Sort field (`title`, `added_date`, `rating`)
- `order` (optional): Sort order (`asc`, `desc`)

**Response: 200 OK**

```json
{
	"entries": [
		{
			"id": "123e4567-e89b-12d3-a456-426614174000",
			"tmdbId": 550,
			"mediaType": "movie",
			"status": "finished",
			"rating": 9,
			"notes": "Great movie!",
			"createdAt": "2023-01-01T00:00:00.000Z",
			"updatedAt": "2023-01-02T00:00:00.000Z"
		}
	],
	"total": 1
}
```

#### POST /watchlist

Adds a new entry to the user's watchlist.

**Request Body:**

```json
{
	"tmdbId": 550,
	"mediaType": "movie",
	"status": "to_watch",
	"notes": "Want to watch this weekend"
}
```

**Response: 201 Created**

```json
{
	"id": "123e4567-e89b-12d3-a456-426614174000",
	"tmdbId": 550,
	"mediaType": "movie",
	"status": "to_watch",
	"notes": "Want to watch this weekend",
	"createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### GET /watchlist/:id

Returns a specific watchlist entry.

**Response: 200 OK**

```json
{
	"id": "123e4567-e89b-12d3-a456-426614174000",
	"tmdbId": 550,
	"mediaType": "movie",
	"status": "to_watch",
	"rating": null,
	"notes": "Want to watch this weekend",
	"createdAt": "2023-01-01T00:00:00.000Z",
	"updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### PATCH /watchlist/:id

Updates a specific watchlist entry.

**Request Body:**

```json
{
	"status": "finished",
	"rating": 9,
	"notes": "Great movie!"
}
```

**Response: 200 OK**

```json
{
	"id": "123e4567-e89b-12d3-a456-426614174000",
	"tmdbId": 550,
	"mediaType": "movie",
	"status": "finished",
	"rating": 9,
	"notes": "Great movie!",
	"updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### DELETE /watchlist/:id

Removes an entry from the watchlist.

**Response: 204 No Content**

## Search Endpoints

#### GET /search

Searches for movies and TV shows via TMDb.

**Query Parameters:**

- `query` (required): Search query string
- `page` (optional): Page number (default: 1)
- `mediaType` (optional): Type of media (`movie`, `tv`, or `both`)

**Response: 200 OK**

```json
{
	"results": [
		{
			"id": 550,
			"title": "Fight Club",
			"mediaType": "movie",
			"releaseDate": "1999-10-15",
			"posterPath": "/path/to/poster.jpg",
			"overview": "An insomniac office worker and a devil-may-care soapmaker form an underground fight club..."
		}
	],
	"page": 1,
	"totalPages": 10,
	"totalResults": 200
}
```

#### GET /search/:id

Gets detailed information about a specific movie or TV show.

**Path Parameters:**

- `id`: TMDb ID

**Query Parameters:**

- `mediaType` (required): Type of media (`movie` or `tv`)

**Response: 200 OK**

```json
{
	"id": 550,
	"title": "Fight Club",
	"mediaType": "movie",
	"releaseDate": "1999-10-15",
	"posterPath": "/path/to/poster.jpg",
	"backdropPath": "/path/to/backdrop.jpg",
	"overview": "An insomniac office worker and a devil-may-care soapmaker form an underground fight club...",
	"genres": ["Drama", "Thriller"],
	"runtime": 139,
	"voteAverage": 8.4,
	"cast": [
		{
			"id": 819,
			"name": "Edward Norton",
			"character": "The Narrator",
			"profilePath": "/path/to/profile.jpg"
		}
	],
	"crew": [
		{
			"id": 7467,
			"name": "David Fincher",
			"job": "Director",
			"profilePath": "/path/to/profile.jpg"
		}
	]
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
