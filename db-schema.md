# 🗄️ Database Schema Documentation

This document outlines the database schema for the PairFlix application.

## Overview

PairFlix uses a PostgreSQL database with the following key entities:

- Users
- Watchlist Entries
- Tags
- Entry Tags
- Activity Log

## Entity Relationship Diagram

```
┌───────────┐       ┌─────────────────┐       ┌───────┐
│           │       │                 │       │       │
│   Users   │◄──────┤ WatchlistEntries├───────┤ Tags  │
│           │       │                 │       │       │
└───────────┘       └─────────────────┘       └───────┘
      ▲                      ▲
      │                      │
      │                      │
┌─────┴─────┐                │
│           │                │
│ActivityLog├────────────────┘
│           │
└───────────┘
```

## Tables Structure

### Users

Stores user account information.

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL CHECK (LENGTH(username) BETWEEN 3 AND 30 AND username ~ '^[a-zA-Z0-9_-]+$'),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Fields:

- `user_id`: Unique identifier (UUID)
- `username`: Display name (3-30 alphanumeric characters with underscores/hyphens)
- `email`: Email address (unique)
- `password_hash`: Bcrypt-hashed password
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

#### Constraints:

- Username must be 3-30 characters, containing only alphanumeric characters, underscores, or hyphens
- Email must be unique

### Watchlist Entries

Stores content items added to user watchlists.

```sql
CREATE TABLE watchlist_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type TEXT CHECK (media_type IN ('movie', 'tv')) NOT NULL,
    status TEXT CHECK (status IN ('to_watch', 'to_watch_together', 'would_like_to_watch_together', 'watching', 'finished')) NOT NULL,
    rating INTEGER CHECK (rating >= 0 AND rating <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Fields:

- `entry_id`: Unique identifier (UUID)
- `user_id`: Reference to user who added this item
- `tmdb_id`: TMDb API identifier for the movie/show
- `media_type`: Type of content ('movie' or 'tv')
- `status`: Current watch status
- `rating`: User rating on scale of 0-10 (optional)
- `notes`: User notes about this content (optional)
- `created_at`: Entry creation timestamp
- `updated_at`: Last update timestamp

#### Constraints:

- Media type must be either 'movie' or 'tv'
- Status must be one of the predefined values
- Rating must be between 0 and 10 if provided

### Tags

Stores tags that can be applied to watchlist entries.

```sql
CREATE TABLE tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);
```

#### Fields:

- `tag_id`: Unique identifier (UUID)
- `name`: Tag name (unique)

### Entry Tags

Junction table linking watchlist entries to tags.

```sql
CREATE TABLE entry_tags (
    entry_id UUID REFERENCES watchlist_entries(entry_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, tag_id)
);
```

#### Fields:

- `entry_id`: Reference to watchlist entry
- `tag_id`: Reference to tag
- Composite primary key of both fields

### Activity Log

Tracks user actions within the system with enhanced contextual data.

```sql
CREATE TABLE activity_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    context TEXT NOT NULL DEFAULT 'system',
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Fields:

- `log_id`: Unique identifier (UUID)
- `user_id`: Reference to user who performed the action
- `action`: Description of the activity
- `context`: Category of the activity (watchlist, user, match, search, media, system)
- `metadata`: JSON data with additional details about the activity
- `ip_address`: IP address from which the activity was performed (for security tracking)
- `user_agent`: Browser/device information (for security tracking)
- `created_at`: Timestamp when the activity occurred

## Indexes

```sql
-- User lookup by email (for login)
CREATE INDEX idx_users_email ON users(email);

-- Watchlist lookup by user
CREATE INDEX idx_watchlist_user_id ON watchlist_entries(user_id);

-- Watchlist lookup by TMDB ID (for matches)
CREATE INDEX idx_watchlist_tmdb_id ON watchlist_entries(tmdb_id);

-- Composite index for match lookups
CREATE INDEX idx_watchlist_user_tmdb ON watchlist_entries(user_id, tmdb_id);

-- Activity log by user
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
```

## Relationships

1. **Users to WatchlistEntries**: One-to-many

   - A user can have multiple watchlist entries
   - Each watchlist entry belongs to exactly one user

2. **WatchlistEntries to Tags**: Many-to-many

   - A watchlist entry can have multiple tags
   - A tag can be applied to multiple watchlist entries
   - Relationship managed through the entry_tags junction table

3. **Users to ActivityLog**: One-to-many
   - A user can have multiple activity log entries
   - Each activity log entry is associated with exactly one user

## Data Types

- **UUID**: Used for all primary keys to ensure global uniqueness
- **TEXT**: Used for string fields with variable length
- **INTEGER**: Used for numeric values like ratings
- **TIMESTAMPTZ**: Timezone-aware timestamps for all date/time fields
- **JSONB**: Binary JSON format for flexible metadata storage

## Migrations

The database structure is managed through migration files located in the `backend/src/db/migrations` directory. These follow the Sequelize migration pattern.

## Seeding

Initial data seeding is provided for development and testing purposes:

- Two default user accounts
- Sample watchlist entries
- Common tags

## Data Access Patterns

1. **Matching Algorithm**

   ```sql
   SELECT * FROM watchlist_entries w1
   JOIN watchlist_entries w2 ON w1.tmdb_id = w2.tmdb_id
   WHERE w1.user_id = $user1 AND w2.user_id = $user2
   ```

2. **User Activity Feed**

   ```sql
   SELECT * FROM activity_log
   WHERE user_id = $userId
   ORDER BY created_at DESC
   LIMIT 20
   ```

3. **Rating Stats**
   ```sql
   SELECT AVG(rating) FROM watchlist_entries
   WHERE user_id = $userId AND rating IS NOT NULL
   ```
