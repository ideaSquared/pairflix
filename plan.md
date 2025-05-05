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

- Authentication for just two users (email + password or magic link).
- No registration—manually set up in database or via config.

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

- **Frontend**: React (with TypeScript), Styled Components or Tailwind
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Auth**: Simple JWT-based login (private, no registration)
- **API Integration**: TMDb REST API (using native fetch)
- **Deployment**: Render or Railway (free tier), optional Vercel for frontend

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
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE watchlist_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    media_type TEXT CHECK (media_type IN ('movie', 'tv')) NOT NULL,
    status TEXT CHECK (status IN ('to_watch', 'watching', 'finished')) NOT NULL,
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

- PostgreSQL with Sequelize ORM integration
- Proper model definitions with TypeScript
- Database initialization and auto-creation
- Development environment seeding with test data
- Automated model synchronization

#### Backend Implementation

- Express.js with TypeScript setup
- JWT-based authentication system
- Sequelize ORM models and relationships:
  - User model with UUID, email, and password hash
  - WatchlistEntry model with comprehensive media tracking
- Development environment database seeding
- RESTful API endpoints for:
  - Authentication (login)
  - Watchlist management (CRUD operations)
  - Match finding between users
- TMDb service integration using native fetch API (removed axios dependency)
- Type-safe request handling with custom types

#### Frontend Implementation

- React with TypeScript and Vite
- Styled-components for styling
- React Query for API state management
- Protected routing system
- Global styling with dark theme
- Responsive layout components
- Feature-based directory structure
- Implemented pages:
  - Login
  - Watchlist
  - Matches

### Components Created

1. **Layout**

   - Base layout with navigation
   - Protected route wrapper
   - Global styling system

2. **Authentication**

   - Login page
   - Authentication hook (useAuth)
   - JWT token management

3. **Watchlist**

   - Watchlist display grid
   - Status management
   - Search functionality
   - Entry cards with status badges

4. **Matches**
   - Match display grid
   - Status comparison view
   - Match cards with dual status display

### API Services

1. **Backend Endpoints**

   - POST /api/auth/login
   - GET /api/watchlist
   - POST /api/watchlist
   - PUT /api/watchlist/:entry_id
   - GET /api/watchlist/matches

2. **Frontend Services**
   - Authentication service
   - Watchlist service
   - TMDb integration service
   - API client with interceptors

### Development Environment

- Hot reloading for both frontend and backend
- TypeScript compilation
- Development database with sample data
- Environment variable management
- Docker volume persistence

### Next Steps

1. **Phase 1 (Current)**

   - ✅ Basic authentication
   - ✅ Watchlist management
   - ✅ Basic match view
   - ⏳ Add user registration system
   - ⏳ Implement TMDb search

2. **Phase 2**

   - ⏳ Activity feed implementation
   - ⏳ Tag system
   - ⏳ Enhanced recommendations
   - ⏳ User preferences

3. **Phase 3**
   - ⏳ Mobile responsiveness
   - ⏳ Notifications system
   - ⏳ Performance optimizations
   - ⏳ Streaming availability integration
