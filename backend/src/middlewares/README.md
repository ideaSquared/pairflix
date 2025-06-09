# Backend Middlewares

This directory contains Express.js middlewares that provide cross-cutting concerns for the PairFlix backend API.

## 📋 Available Middlewares

### Authentication (`auth.ts`)

Handles JWT token validation and user authentication.

**Usage:**

```typescript
import { authenticateToken } from './middlewares/auth';

// Protect a route
app.get('/protected', authenticateToken, (req, res) => {
	// Access authenticated user via req.user
});
```

**Features:**

- JWT token validation
- User object attachment to request
- Token expiration handling
- Error responses for invalid tokens

### Admin-Only Access (`admin-only.ts`)

Restricts access to admin-only routes.

**Usage:**

```typescript
import { adminOnlyMiddleware } from './middlewares/admin-only';

// Admin-only route
app.get('/admin/users', authenticateToken, adminOnlyMiddleware, handler);
```

**Features:**

- Role-based access control
- Admin role validation
- Automatic 403 responses for non-admin users

### Rate Limiting (`rate-limiter.ts`)

Comprehensive rate limiting to prevent abuse and DoS attacks.

**Available Rate Limiters:**

- `generalRateLimit` - 100 req/15min (global)
- `authRateLimit` - 10 req/15min (auth endpoints)
- `searchRateLimit` - 30 req/1min (search endpoints)
- `adminRateLimit` - 50 req/15min (admin endpoints)
- `strictRateLimit` - 5 req/15min (sensitive operations)

**Usage:**

```typescript
import { generalRateLimit, authRateLimit } from './middlewares/rate-limiter';

// Apply global rate limiting
app.use(generalRateLimit);

// Apply specific rate limiting
app.use('/api/auth', authRateLimit, authRoutes);
```

**Features:**

- IP-based rate limiting
- Custom error messages
- Standard rate limit headers
- Different limits for different endpoints

### Error Handling (`error-handler.ts`)

Global error handling middleware for consistent error responses.

**Usage:**

```typescript
import { errorHandler } from './middlewares/error-handler';

// Apply as last middleware
app.use(errorHandler);
```

**Features:**

- Consistent error response format
- Error logging
- Development vs production error details
- HTTP status code handling

### Request Logging (`request-logger.ts`)

Logs incoming requests for monitoring and debugging.

**Usage:**

```typescript
import { requestLogger } from './middlewares/request-logger';

// Apply early in middleware chain
app.use(requestLogger);
```

**Features:**

- Request method and URL logging
- Response time tracking
- User identification (if authenticated)
- Audit trail creation

## 🔧 Middleware Architecture

### Execution Order

The middlewares are applied in a specific order for optimal functionality:

1. **CORS** - Handle cross-origin requests
2. **Rate Limiting** - Apply rate limits early
3. **Request Logging** - Log all incoming requests
4. **Body Parsing** - Parse JSON bodies
5. **Authentication** - Validate JWT tokens (route-specific)
6. **Authorization** - Check user roles (route-specific)
7. **Route Handlers** - Execute business logic
8. **Error Handling** - Handle any errors

### Configuration

Most middlewares can be configured via environment variables:

```bash
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

## 🧪 Testing

Each middleware has comprehensive unit tests:

```bash
# Run middleware tests
npm test -- middlewares/

# Test specific middleware
npm test -- auth.test.ts
npm test -- rate-limiter.test.ts
```

### Test Structure

- **Unit Tests**: Individual middleware functionality
- **Integration Tests**: Middleware interaction with routes
- **Error Cases**: Invalid inputs and edge cases
- **Security Tests**: Authentication and authorization scenarios

## 🔒 Security Considerations

### Authentication Security

- Strong JWT secrets (minimum 32 characters)
- Token expiration validation
- Protection against token tampering
- Secure token storage recommendations

### Rate Limiting Security

- IP-based limiting to prevent distributed attacks
- Different limits for different endpoint types
- Rate limit headers for client awareness
- Memory-based storage (consider Redis for production scaling)

### Error Handling Security

- No sensitive information in error responses
- Consistent error format
- Proper HTTP status codes
- Error logging for security monitoring

### Logging Security

- No sensitive data in logs (passwords, tokens)
- User privacy considerations
- Log retention policies
- Access control for log files

## 📚 Best Practices

### Adding New Middleware

1. **Create the middleware file**

   ```typescript
   // middlewares/my-middleware.ts
   import { Request, Response, NextFunction } from 'express';

   export const myMiddleware = (
   	req: Request,
   	res: Response,
   	next: NextFunction
   ) => {
   	// Middleware logic
   	next();
   };
   ```

2. **Add comprehensive tests**

   ```typescript
   // middlewares/my-middleware.test.ts
   describe('My Middleware', () => {
   	it('should handle valid requests', () => {
   		// Test implementation
   	});
   });
   ```

3. **Update documentation**

   - Add to this README
   - Update relevant API documentation
   - Include usage examples

4. **Apply middleware appropriately**
   - Consider execution order
   - Apply to appropriate routes
   - Configure error handling

### Middleware Guidelines

- **Single Responsibility**: Each middleware should have one clear purpose
- **Error Handling**: Always handle errors gracefully
- **Performance**: Avoid expensive operations in middleware
- **Security**: Validate inputs and sanitize data
- **Testing**: Write comprehensive unit and integration tests
- **Documentation**: Document usage and configuration options

## 🔍 Debugging

### Enable Debug Logging

```bash
DEBUG=pairflix:middleware npm run dev
```

### Common Issues

1. **Authentication Failures**

   - Check JWT secret configuration
   - Verify token format and expiration
   - Ensure proper header format

2. **Rate Limiting Issues**

   - Check IP address extraction
   - Verify rate limit configuration
   - Monitor rate limit headers

3. **Error Handling Problems**
   - Ensure error middleware is last
   - Check error object structure
   - Verify status code handling

## 📖 Further Reading

- **[Security Documentation](../docs/SECURITY.md)** - Comprehensive security guide
- **[API Documentation](../../api-docs.md)** - Complete API reference
- **[Backend README](../README.md)** - Backend overview and setup

---

**For security-related middleware questions, please refer to the [Security Documentation](../docs/SECURITY.md).**
