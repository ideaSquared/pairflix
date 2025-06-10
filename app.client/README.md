# PairFlix Client Application

The main user-facing React application for the PairFlix movie and TV show discovery platform.

## 🎬 Overview

The PairFlix client application provides users with an intuitive interface to discover movies and TV shows, manage personal watchlists, find viewing partners with similar interests, and engage with the PairFlix community.

## ✨ Features

### Content Discovery

- **Browse & Search**: Discover movies and TV shows using TMDB integration
- **Trending Content**: View popular and trending content
- **Detailed Information**: Access comprehensive details, trailers, and metadata
- **Genre Filtering**: Filter content by genres and categories

### Personal Watchlists

- **Add to Watchlist**: Save interesting content for later viewing
- **Rating & Reviews**: Rate watched content and write reviews
- **Status Tracking**: Mark content as watched, watching, or want to watch
- **Personal Notes**: Add private notes and tags to watchlist items

### Social Features

- **Find Partners**: Discover users with similar viewing interests
- **Social Activity Feeds**: See what matched partners are watching with privacy-focused filtering
- **Recommendations**: Get personalized content recommendations
- **User Profiles**: Manage personal profiles and preferences

### User Experience

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Themes**: Toggle between theme preferences
- **Fast Navigation**: Smooth, single-page application experience
- **Real-time Updates**: Live updates for matches and activities

## 🛠️ Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and building
- **Routing**: React Router for client-side navigation
- **State Management**: React Query for API state management
- **Styling**: styled-components with theme support
- **UI Components**: Custom component library (`@pairflix/components`)
- **HTTP Client**: Axios for API communication
- **Testing**: Jest + React Testing Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PairFlix backend API running

### Installation

1. **Navigate to client directory**

   ```bash
   cd app.client
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

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
app.client/
├── public/                 # Static assets
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Shared components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Watchlist.tsx
│   │   ├── Search.tsx
│   │   └── Profile.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useWatchlist.ts
│   │   └── useApi.ts
│   ├── services/          # API service layer
│   │   ├── api.ts         # Base API configuration
│   │   ├── auth.service.ts
│   │   ├── watchlist.service.ts
│   │   └── tmdb.service.ts
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # Global styles and themes
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🔐 Authentication

### User Authentication Flow

1. **Registration/Login**: Users create accounts or sign in
2. **JWT Tokens**: Authentication using JWT tokens
3. **Persistent Sessions**: Remember user sessions across browser restarts
4. **Secure Storage**: Tokens stored securely in httpOnly cookies or localStorage

### Protected Routes

- Watchlist management
- User profile and preferences
- Social features (matching, filtered activity feeds with partner privacy)
- User-specific content and recommendations

## 🌐 API Integration

### Backend Communication

The client communicates with the PairFlix backend API for:

- User authentication and management
- Watchlist operations
- Social features and matching
- Social activity tracking with partner-based filtering

### TMDB Integration

Direct integration with The Movie Database (TMDB) for:

- Content discovery and search
- Movie and TV show metadata
- Trending and popular content
- Images and trailers

### Error Handling

- Global error boundaries for React errors
- API error handling with user-friendly messages
- Network failure recovery and retry logic
- Graceful degradation for offline scenarios

## 🎨 Theming & Styling

### Theme System

```typescript
// Light and dark theme support
const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#212529',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
};
```

### Component Styling

- styled-components for component-scoped styles
- Shared component library for consistency
- Responsive design patterns
- Accessibility-focused styling

## 🧪 Testing

### Test Structure

```bash
src/
├── __tests__/             # Integration tests
├── components/*.test.tsx   # Component unit tests
├── hooks/*.test.ts        # Custom hook tests
├── services/*.test.ts     # Service layer tests
└── utils/*.test.ts        # Utility function tests
```

### Testing Strategy

- **Unit Tests**: Individual components and functions
- **Integration Tests**: User workflows and API integration
- **Accessibility Tests**: WCAG compliance testing
- **Visual Regression**: Component visual consistency

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Watchlist.test.tsx
```

## 🔄 Development Workflow

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test            # Run test suite
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm run type-check  # TypeScript type checking
```

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_TMDB_API_KEY=your-tmdb-api-key

# Application Configuration
VITE_APP_TITLE=PairFlix
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_EXPERIMENTAL_FEATURES=false
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px (Phone portrait/landscape)
- **Tablet**: 768px - 1024px (Tablet portrait/landscape)
- **Desktop**: > 1024px (Desktop and large screens)

### Mobile-First Approach

- Progressive enhancement from mobile to desktop
- Touch-friendly interface elements
- Optimized content loading for mobile networks
- Gesture support for mobile interactions

## 🚀 Performance Optimization

### Code Splitting

- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy features

### Caching Strategy

- API response caching with React Query
- Asset caching with Vite
- Browser caching for static resources

### Bundle Optimization

- Tree shaking for unused code elimination
- Minification and compression
- Asset optimization (images, fonts)

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

### Docker

```bash
# Build image
docker build -t pairflix-client .

# Run container
docker run -p 80:80 pairflix-client
```

### Environment Configuration

- Configure API endpoints for production
- Set up proper CORS configuration
- Configure TMDB API integration
- Set up error tracking (Sentry, etc.)

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**

   - Verify backend is running
   - Check VITE_API_BASE_URL configuration
   - Ensure CORS is properly configured

2. **TMDB API Issues**

   - Verify TMDB API key is valid
   - Check API rate limits
   - Validate API responses

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check TypeScript compilation errors
   - Verify environment variables

### Debug Mode

```bash
# Enable debug logging
DEBUG=pairflix:* npm run dev
```

## 🤝 Contributing

1. Follow React and TypeScript best practices
2. Write tests for new components and features
3. Use conventional commit messages
4. Ensure accessibility compliance
5. Update documentation as needed

### Code Style

- Use functional components with hooks
- Follow ESLint and Prettier configuration
- Use TypeScript strict mode
- Write meaningful prop and state interfaces

---

For more information, see the [main project README](../README.md) and [component library documentation](../lib.components/README.md).
