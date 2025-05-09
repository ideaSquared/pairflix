## 📄 Product Requirements Document (PRD)

### Product Name

**PairFlix**

### Summary

A private web application for two users (you and your partner) to:

- Track TV shows and movies you're watching or want to watch.
- See overlaps and differences in preferences.
- Get simple "match recommendations" for shows or movies you both may enjoy.

### Goals

- Make it easy for two people to track their watchlists.
- Suggest mutually agreeable content.
- Keep the app private and simple, optimized for couple usage.

---

### Features

#### 1. **User Accounts**

- Authentication using JWT tokens with username, email, and user_id
- No public registration—manually set up in database
- Comprehensive user management:
  - Username (3-30 characters, alphanumeric with underscore/hyphen)
  - Email address (with validation)
  - Password (with secure hashing)
  - Profile settings and updates
- Profile features:
  - Change username with uniqueness validation
  - Update email with password verification
  - Change password with current password verification
  - View profile information

#### 2. **Watchlist**

- Track shows/movies:

  - Status: To Watch / Watching / Finished
  - Rating (1–10)
  - Personal comments

- Allow tagging (e.g., Comedy, Horror, "Date night").

#### 3. **Match View**

- Shows the overlap between both users’ watchlists.
- Suggest content you both haven’t watched but may like (based on genre/ratings/tags).

#### 4. **Search and Discovery**

- Search for movies/TV shows.
- View metadata: synopsis, year, genre, image.

#### 5. **Content Detail View**

- Show poster, synopsis, streaming availability, cast, runtime.

#### 6. **Simple Activity Feed**

- "You added X to your list"
- "You rated Y"

---

### Technical Requirements

- Must be accessible from web (mobile + desktop responsive).
- Secure with private access for only 2 users.
- Persist data (PostgreSQL).
- API-first architecture to allow future mobile app.
- Free to run (within reasonable limits).

---

## 🔍 Free Content APIs (Research)

### 🏆 1. **TMDb API** (Recommended)

- **URL**: [https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api)
- **Pros**: Free for personal use, rich data (shows, movies, posters, metadata).
- **Limits**: 40 requests every 10 seconds, 1000 requests/day (non-authenticated).
- **Note**: Attribution required (but for a private app this is a formality).

### 2. **Trakt.tv API**

- **URL**: [https://trakt.docs.apiary.io/](https://trakt.docs.apiary.io/)
- **Pros**: Tracks watched history, supports user ratings, syncs across devices.
- **Cons**: Requires OAuth; better for public apps or syncing.

### 3. **JustWatch (Unofficial)**

- **Note**: No official API. Some libraries scrape JustWatch to get streaming availability.
- **Risk**: Can break or be blocked.

**Recommendation**: Use **TMDb** as the primary metadata source and skip unofficial APIs unless essential.

---

## 🏗 Architecture Plan

### Tech Stack

- **Frontend**:
  - React with TypeScript
  - Styled Components for styling
  - React Query for data fetching
  - JWT handling with local storage
  - Vite for build tooling
- **Backend**:
  - Node.js + Express + TypeScript
  - Sequelize ORM with PostgreSQL
  - JWT-based authentication
  - bcryptjs for password hashing
  - Jest for testing
- **Database**:
  - PostgreSQL with UUID, JSONB support
  - Sequelize migrations and seeding
- **API Integration**:
  - TMDb REST API
  - Native fetch API
- **DevOps**:
  - Docker with multi-stage builds
  - docker-compose for development
  - Hot reloading for both frontend and backend

---

### System Architecture Diagram (simplified)

```plaintext
              ┌────────────────────────┐
              │   React Web App        │
              │  (TV Tracker UI)       │
              └────────┬───────────────┘
                       │
           HTTPS (REST, JWT Auth)
                       │
              ┌────────▼─────────────┐
              │  Express + TypeScript│
              │     Backend API      │
              └──────┬──────┬────────┘
                     │      │
                     ▼      ▼
         PostgreSQL DB    TMDb API
        (User data, tags,  (metadata)
         ratings, watchlist)
```

---

### Dev Plan

#### Phase 1 - MVP

- User authentication (hardcoded 2 users).
- Add/search TV/movie from TMDb.
- Save to personal watchlist.
- Basic match view (titles you both want to watch).
- PostgreSQL schema: `User`, `WatchlistEntry`, `Tag`, `ActivityLog`

#### Phase 2

- Activity feed.
- Smart recommendations based on shared genres/ratings.
- Add tags & notes.

#### Phase 3

- Notifications (optional).
- Mobile app (React Native, same backend).
- Streaming availability (optional, if TMDb doesn't suffice).

Great — below is a full **PostgreSQL schema** followed by a clean, modular **file structure** for both backend and frontend using modern best practices.

---

## 🗄 PostgreSQL Schema

### Tables:

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL CHECK (LENGTH(username) BETWEEN 3 AND 30 AND username ~ '^[a-zA-Z0-9_-]+$'),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE entry_tags (
    entry_id UUID REFERENCES watchlist_entries(entry_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, tag_id)
);

CREATE TABLE activity_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

> Uses `tmdb_id` for linking to external TMDb metadata.

---

## 📁 File Structure

### 📦 Root Monorepo (or polyrepo if preferred)

```plaintext
watch-together/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── db/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── watchlist/
│   │   │   ├── match/
│   │   │   └── activity/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/  ← API clients
│   │   ├── types/
│   │   └── App.tsx
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
```

---

### 📂 Backend Modules

- `controllers/` – Handles request/response lifecycle
- `routes/` – Express route definitions
- `services/` – Business logic (e.g., `watchlistService.ts`, `matchService.ts`)
- `models/` – ORM definitions (if using Sequelize/Prisma), or raw SQL abstraction
- `db/` – DB connection & init
- `middlewares/` – Auth, error handling, etc.
- `types/` – TypeScript interfaces
- `utils/` – Helpers (e.g., TMDb API wrapper)

---

### 📂 Frontend Modules

- `features/` is domain-based modular structure:

  - `auth/` – login form, session
  - `watchlist/` – add/search/edit items
  - `match/` – shared list/recommendations
  - `activity/` – feed of user actions

- `components/` – Reusable UI components

- `pages/` – Route-level pages (e.g., `/login`, `/watchlist`)

- `hooks/` – Shared React hooks

- `services/` – Axios-based TMDb + backend API wrappers

- `types/` – Shared types/interfaces

---

## 🚀 Implementation Status

### Completed Infrastructure

#### Database Architecture

- ✅ PostgreSQL with Sequelize ORM integration
- ✅ Models: User, WatchlistEntry, Match
- ✅ Database initialization and migrations
- ✅ Development environment setup

#### Backend Implementation

- ✅ Express.js with TypeScript
- ✅ JWT authentication system
- ✅ Controllers for auth, match, search, user, and watchlist
- ✅ Service layer with comprehensive test coverage
- ✅ TMDb integration
- ✅ Middleware for authentication
- ✅ Type-safe request handling

#### Frontend Implementation

- ✅ React + TypeScript + Vite setup
- ✅ Component library with common UI elements
- ✅ Feature-based architecture
- ✅ Layout system with responsive design
- ✅ Authentication flow
- ✅ Watchlist management
- ✅ Search functionality
- ✅ Match system

#### DevOps

- ✅ Docker containerization
- ✅ Development environment with docker-compose
- ✅ Hot reloading for development

### Current Focus Areas

1. **Enhancing Match System**

   - Recommendation Algorithm Improvements:

     - Consider user ratings (1-10) and genres for better matches
     - Weight recent watches more heavily than older entries
     - Factor in completion status (finished vs dropped)
     - Target: 80% match accuracy based on user feedback

   - Collaborative Filtering Implementation:

     - Use both users' watch history to suggest new content
     - Identify patterns in genre preferences and ratings
     - Generate top 5 recommendations weekly

   - Match Notifications:
     - Send notifications when both users add same title to watchlist
     - Alert when partner rates a shared watch
     - Allow toggling notification preferences

2. **User Experience**

   - Interactive Watchlist Features:

     - Drag-and-drop reordering of watchlist items
     - Bulk actions (delete, status update, tag application)
     - Quick rating update without modal
     - Filter by status, genre, and rating range

   - Error Handling:
     - Implement retry logic for failed API calls
     - Offline mode with local storage backup
     - Clear error messages with recovery actions
     - Automated error reporting system

3. **Testing & Quality**

   - Test Coverage Goals:

     - Unit tests: 90% coverage
     - Integration tests: 80% coverage
     - E2E tests for critical flows:
       - Authentication
       - Watchlist management
       - Match system
       - Search functionality

   - Performance Metrics:
     - Page load time < 2 seconds
     - Time to interactive < 3 seconds
     - API response time < 200ms
     - Lighthouse score > 90

### Future Enhancements

1. **Phase 1 (Refinement)**

   - User Preference Settings:

     - Theme customization (light/dark + color schemes)
     - Default view preferences (list/grid)
     - Email notification frequency
     - Automatic archiving rules for finished content

   - Profile Management:

     - Custom avatar upload (max 2MB, jpg/png)
     - Watching habits statistics
     - Favorite genres selection
     - Privacy controls for activity sharing

   - Advanced Search Filters:
     - Filter by release year range
     - Multiple genre selection
     - Runtime/episode count filters
     - Streaming service availability
     - Rating range (TMDb rating)

2. **Phase 2 (Features)**

   - Activity Feed:

     - Chronological list of partner's actions
     - Filterable by action type
     - Interactive (react/comment on activities)
     - 30-day activity history

   - Tag System:

     - Custom tag creation
     - Tag categories (mood, occasion, genre)
     - Tag-based filtering
     - Tag suggestions based on content

   - Watch History:
     - Timeline view of watched content
     - Watch dates tracking
     - Rewatch counter
     - Watch time statistics
     - Export functionality (CSV/JSON)

3. **Phase 3 (Scale)**
   - Mobile responsiveness improvements
   - Push notifications
   - Offline support
   - Streaming service integration
