# PairFlix Admin Panel

This is the admin application for PairFlix, designed as a separate application from the main PairFlix frontend to provide secure admin functionality.

## Features

- **Dashboard**: View key metrics and recent activities
- **User Management**: Search, view, and manage user accounts
- **Activity Logs**: Monitor user activities with advanced filtering
- **Settings**: Manage application-wide configuration

## Getting Started

### Prerequisites

- Node.js 16+
- npm 7+
- PairFlix backend API running

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. The admin panel will be available at [http://localhost:5174](http://localhost:5174)

## Development

The admin app is built as a separate application from the main PairFlix frontend for several reasons:

1. **Security Separation**: Keeps admin functionality isolated from user functionality
2. **Independent Deployment**: Can be deployed to a different domain/subdomain
3. **Tailored UI/UX**: Admin interfaces have different needs than user interfaces
4. **Permission Control**: Easier to manage admin-only permissions

### Key Files

- `src/App.tsx`: Main application component with routing
- `src/contexts/AdminAuthContext.tsx`: Authentication context for admin users
- `src/components/layouts/AdminLayout.tsx`: Main layout for admin pages
- `src/services/api.service.ts`: Service for making API calls to the backend

### Adding New Admin Features

1. Create a new folder in `src/features/[feature-name]`
2. Create your component in this folder
3. Add a route in `App.tsx`
4. Add a navigation link in `AdminLayout.tsx`

## Authentication

The admin app uses JWT authentication with tokens stored in localStorage. The token is sent with each API request via the `Authorization` header.

## Deployment

### Build for Production

```bash
npm run build
```

This will generate a `dist` folder with optimized production assets.

### Deployment Options

1. **Separate Domain/Subdomain**: Deploy to admin.yourapp.com
2. **Path-Based Deployment**: Deploy to yourapp.com/admin
3. **Access Control**: Ensure the admin app is only accessible by authorized users

## Security Considerations

- Always use HTTPS in production
- Consider IP restrictions for admin access
- Implement rate limiting on admin login endpoints
- Use strong passwords and consider 2FA for admin accounts
