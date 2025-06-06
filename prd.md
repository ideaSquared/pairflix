# 📄 Product Requirements Document (PRD)

## Product Name

**PairFlix**

## Summary

PairFlix is a private web application designed specifically for two users (couples or close friends) to:

- Track TV shows and movies they're watching or want to watch
- See overlaps and differences in their viewing preferences
- Get personalized match recommendations for content they both may enjoy

## User Stories

### User Accounts

- As a user, I want to securely log in to a private account so that my watchlist remains private
- As a user, I want to update my profile information so that my account stays current
- As a user, I want to change my password periodically to ensure account security

### Watchlist Management

- As a user, I want to add movies/shows to my watchlist so I can keep track of what I want to watch
- As a user, I want to categorize content as "To Watch," "Watching," or "Finished" to organize my viewing
- As a user, I want to rate content on a scale of 1-10 to remember my preferences
- As a user, I want to add personal notes to watchlist entries to record my thoughts

### Content Discovery

- As a user, I want to search for movies and TV shows by title to find specific content
- As a user, I want to view detailed information about shows/movies to make informed decisions
- As a user, I want to see movie/show metadata including synopsis, year, and genre

### Match System

- As a user, I want to see content that both my partner and I want to watch to make viewing decisions easier
- As a user, I want personalized recommendations based on our mutual preferences to discover new content
- As a user, I want to see similarities in our watchlists to understand our shared tastes

### Activity Tracking

- As a user, I want to see a record of my partner's watchlist activities to stay updated
- As a user, I want to know when my partner rates something we've both watched to compare opinions

## Acceptance Criteria

### User Authentication

- [x] JWT-based authentication system with secure token storage
- [x] Password hashing using bcrypt with appropriate salt rounds
- [x] User profile management with validation
- [x] No public registration (manual account setup only)

### Watchlist Features

- [x] Add/remove content from personal watchlist
- [x] Update watch status (To Watch/Watching/Finished)
- [x] Rating system (1-10 scale)
- [x] Notes/comments on watchlist items
- [x] Tag system for content categorization

### Search & Discovery

- [x] Search functionality using TMDb API
- [x] Content details display with comprehensive metadata
- [x] Responsive content cards with visual elements

### Match System

- [x] Match view showing overlapping watchlist items
- [x] Recommendation algorithm based on mutual preferences
- [x] Filtering and sorting of matched content

### Technical Requirements

- [x] Responsive design (mobile and desktop)
- [x] Secure access limited to two authorized users
- [x] PostgreSQL database for data persistence
- [x] API-first architecture for potential future expansion
- [x] Performance optimization for key user flows

## Technical Constraints & Notes

- The application must use the TMDb API for content metadata
- The system must comply with TMDb API rate limits (40 requests/10 seconds)
- Authentication must use short-lived JWTs with refresh token rotation
- The database schema must support UUIDs for primary keys
- The application must support modern browsers only

## Priority Level

P0 (Critical) - This is the core functionality that defines the application's purpose and unique value proposition.

## Development Roadmap

### Phase 1 - MVP (Completed)

- User authentication for two users
- Basic watchlist management
- Movie/TV show search via TMDb
- Match view for overlapping content
- Core database schema and API endpoints

### Phase 2 - Enhancement (In Progress)

- Activity feed implementation
- Smart recommendations based on shared preferences
- Tag system for content organization
- UI/UX improvements for mobile responsiveness

### Phase 3 - Future Features (Planned)

- Optional notifications system
- Potential mobile app using React Native
- Enhanced recommendation algorithms
- Streaming service availability indicators
