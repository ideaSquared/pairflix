# 🔑 Account Creation System

## Overview

The PairFlix account creation system allows new users to register for accounts directly through the client application. This feature replaces the previous manual account setup process and provides a streamlined onboarding experience.

## Features

### Frontend Components

#### RegisterPage (`app.client/src/features/auth/RegisterPage.tsx`)

A comprehensive registration form with:

- **Username field**: 3-30 characters, alphanumeric with underscores and hyphens
- **Email field**: Valid email address validation
- **Password field**: Minimum 8 characters
- **Confirm Password field**: Must match the password
- **Client-side validation**: Real-time form validation with error messages
- **Loading states**: Prevents double submission and provides user feedback
- **Navigation links**: Link to login page for existing users

#### Updated LoginPage

The login page now includes a "Create one here" link that navigates to the registration page.

### Backend Implementation

#### Registration Endpoint (`POST /api/auth/register`)

**Location**: `backend/src/controllers/auth.controller.ts`

**Validation Rules**:

- Email: Must be valid email format and unique
- Username: 3-30 characters, alphanumeric with underscores/hyphens, must be unique
- Password: Minimum 8 characters

**Security Features**:

- Password hashing with bcrypt (12 salt rounds)
- Comprehensive audit logging for registration attempts
- Input sanitization and validation
- Proper error handling with specific error messages

**Response**: Returns JWT token and user object for automatic login after registration

### Security Considerations

#### Password Security

- Minimum 8 character requirement
- Passwords are hashed using bcrypt with 12 salt rounds
- Passwords are never stored in plain text

#### Validation & Sanitization

- Email format validation using regex
- Username format validation (alphanumeric + underscore/hyphen)
- SQL injection prevention through Sequelize ORM
- XSS prevention through input validation

#### Audit Logging

All registration attempts are logged with:

- Timestamp
- IP address
- User agent
- Email/username attempted
- Success/failure status
- Detailed error information

## API Documentation

### Register Endpoint

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "johndoe"
}
```

#### Success Response (201 Created)

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

#### Error Responses

**400 Bad Request - Missing Fields**

```json
{
  "error": "Email, password, and username are required"
}
```

**400 Bad Request - Invalid Email**

```json
{
  "error": "Please provide a valid email address"
}
```

**400 Bad Request - Invalid Username**

```json
{
  "error": "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens"
}
```

**400 Bad Request - Weak Password**

```json
{
  "error": "Password must be at least 8 characters long"
}
```

**409 Conflict - Email Exists**

```json
{
  "error": "An account with this email address already exists"
}
```

**409 Conflict - Username Exists**

```json
{
  "error": "This username is already taken"
}
```

**500 Internal Server Error**

```json
{
  "error": "Registration failed. Please try again."
}
```

## User Experience Flow

1. **Landing**: New users can access the registration page via link on login page or direct navigation to `/register`
2. **Form Completion**: Users fill out the registration form with real-time validation feedback
3. **Submission**: Form is validated client-side before submission
4. **Server Processing**: Backend validates data, checks for duplicates, creates user account
5. **Auto-Login**: Upon successful registration, user is automatically logged in with JWT token
6. **Redirect**: User is redirected to their watchlist page to begin using the application

## Default User Settings

New accounts are created with the following default preferences:

- **Theme**: Dark mode
- **View Style**: Grid view for content
- **Email Notifications**: Enabled
- **Auto Archive**: 30 days
- **Favorite Genres**: Empty array (user can customize later)
- **Role**: `user` (standard user permissions)
- **Status**: `active` (account ready for use)

## Testing

### Backend Tests

Comprehensive test suite in `backend/src/controllers/auth.controller.test.ts` covers:

- ✅ Successful registration with valid data
- ✅ Validation errors for missing fields
- ✅ Email format validation
- ✅ Username format validation
- ✅ Password length validation
- ✅ Duplicate email detection
- ✅ Duplicate username detection
- ✅ Error handling for database issues
- ✅ Audit logging verification

### Frontend Testing

The RegisterPage component includes:

- Form validation logic
- Error state handling
- Loading state management
- Navigation integration

## Migration from Manual Account Setup

This feature replaces the previous manual account setup process mentioned in the PRD. The system now supports:

- **Self-service registration**: Users can create accounts without administrator intervention
- **Immediate access**: Automatic login after successful registration
- **Secure onboarding**: Comprehensive validation and security measures
- **Audit trail**: Full logging of registration activities for security monitoring

## Monitoring & Analytics

The registration system provides monitoring capabilities through:

### Audit Logs

- Registration attempts and outcomes
- IP address tracking for security
- User agent information
- Detailed error tracking

### Security Monitoring

- Failed registration attempts
- Duplicate account creation attempts
- Potential abuse pattern detection

## Future Enhancements

Potential improvements for future releases:

- Email verification process
- CAPTCHA integration for bot prevention
- Social login options (Google, GitHub, etc.)
- Advanced password requirements
- Account recovery mechanisms
- Registration rate limiting per IP

## Configuration

### Environment Variables

- `JWT_SECRET`: Secret key for JWT token generation
- Database connection settings for user storage

### Security Settings

- bcrypt salt rounds: 12 (configurable in code)
- JWT token expiration: 7 days
- Password minimum length: 8 characters (configurable)

## Related Files

### Backend

- `backend/src/controllers/auth.controller.ts` - Registration logic
- `backend/src/routes/auth.routes.ts` - Route definitions
- `backend/src/models/User.ts` - User model with validation
- `backend/src/controllers/auth.controller.test.ts` - Test suite

### Frontend

- `app.client/src/features/auth/RegisterPage.tsx` - Registration form
- `app.client/src/features/auth/LoginPage.tsx` - Updated with register link
- `app.client/src/services/api/auth.ts` - Registration API client
- `app.client/src/components/layout/Routes.tsx` - Route configuration

### Documentation

- `docs/api-docs.md` - API endpoint documentation
- `docs/prd.md` - Updated product requirements
