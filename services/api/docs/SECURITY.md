# Security Documentation

This document outlines the security measures implemented in the PairFlix backend API.

## 🔒 Overview

The PairFlix backend implements multiple layers of security to protect against common attacks and ensure data integrity. Security measures include rate limiting, authentication, authorization, input validation, and comprehensive logging.

## 🛡️ Rate Limiting

The backend implements comprehensive rate limiting using the `express-rate-limit` package to protect against denial-of-service (DoS) attacks and abuse.

### Rate Limiters

#### General Rate Limit

- **Limit**: 100 requests per 15 minutes per IP
- **Applied to**: All API endpoints
- **Purpose**: General protection against abuse
- **Headers**: Includes standard `RateLimit-*` headers

#### Authentication Rate Limit

- **Limit**: 10 requests per 15 minutes per IP
- **Applied to**: `/api/auth` routes
- **Purpose**: Prevent brute force attacks on authentication
- **Special feature**: Skips counting successful requests
- **Error Response**: Custom message for authentication attempts

#### Search Rate Limit

- **Limit**: 30 requests per 1 minute per IP
- **Applied to**: `/api/search` routes
- **Purpose**: Prevent abuse of potentially resource-intensive search operations
- **Window**: Shorter window for more granular control

#### Admin Rate Limit

- **Limit**: 50 requests per 15 minutes per IP
- **Applied to**: `/api/admin` routes
- **Purpose**: Additional protection for administrative operations
- **Scope**: Applied to all admin endpoints

#### Strict Rate Limit

- **Limit**: 5 requests per 15 minutes per IP
- **Applied to**: Sensitive admin operations such as:
  - User creation/deletion (`POST /api/admin/users`, `DELETE /api/admin/users/:id`)
  - User status changes (`PUT /api/admin/users/:id/status`)
  - Password resets (`POST /api/admin/users/:id/reset-password`)
  - Content moderation actions (`PUT /api/admin/content/:id/flag`, etc.)
- **Purpose**: Maximum protection for critical operations

### Rate Limit Headers

The middleware includes standard rate limit headers in responses:

- `RateLimit-Limit`: Request limit per window
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit window resets

### Error Response Format

When rate limit is exceeded, the API returns:

- **Status Code**: 429 (Too Many Requests)
- **Response Body**: JSON object with error message and retry information

Example:

```json
{
	"error": "Too many requests from this IP, please try again later.",
	"retryAfter": "15 minutes"
}
```

### Implementation Details

1. **IP-Based Limiting**: Rate limits are applied per client IP address
2. **Middleware Stacking**: Multiple rate limiters can apply to the same route
3. **Memory Storage**: Uses in-memory storage (suitable for single-instance deployments)
4. **Ordering**: Rate limiting occurs before authentication for efficiency
5. **Production Considerations**: For multi-instance deployments, consider Redis-backed storage

## 🔑 Authentication & Authorization

### JWT Token Security

- **Algorithm**: HS256 (HMAC SHA-256)
- **Secret**: Strong secret key stored in environment variables
- **Expiration**: Configurable token lifetime (default: 7 days)
- **Refresh**: Tokens must be refreshed before expiration

### Password Security

- **Hashing**: bcrypt with salt rounds (minimum 12)
- **Complexity**: Enforced password complexity requirements
- **History**: Prevention of password reuse (if implemented)

### Role-Based Access Control (RBAC)

- **User Role**: Standard user permissions
- **Admin Role**: Administrative access with elevated privileges
- **Middleware**: Role validation on protected routes

### Session Management

- **Stateless**: JWT tokens for stateless authentication
- **Logout**: Token invalidation (blacklist or short expiration)
- **Security Headers**: Secure cookie settings when applicable

## 🛡️ Input Validation & Sanitization

### Request Validation

- **Schema Validation**: JSON schema validation for all endpoints
- **Type Safety**: TypeScript types enforced at runtime
- **Sanitization**: Input sanitization to prevent injection attacks

### SQL Injection Prevention

- **ORM**: Sequelize ORM with parameterized queries
- **Validation**: Input validation before database operations
- **Escaping**: Automatic SQL escaping through ORM

### XSS Prevention

- **Output Encoding**: Proper output encoding for user-generated content
- **Content Security Policy**: CSP headers for frontend applications
- **Input Sanitization**: HTML sanitization for user inputs

## 🌐 CORS & HTTP Security

### CORS Configuration

```javascript
const corsOptions = {
	origin: allowedOrigins,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	exposedHeaders: ['Authorization'],
};
```

### Security Headers

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block
- **Strict-Transport-Security**: HTTPS enforcement

## 📝 Audit Logging

### Security Event Logging

- **Authentication Events**: Login attempts, failures, token usage
- **Authorization Events**: Access denials, privilege escalations
- **Administrative Actions**: User management, system changes
- **Security Violations**: Rate limit violations, suspicious activity

### Log Structure

```typescript
interface AuditLog {
	log_id: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	source: string;
	context: Record<string, any>;
	created_at: Date;
}
```

### Log Retention

- **Development**: 30 days retention
- **Production**: 90 days retention (configurable)
- **Critical Events**: Extended retention for security incidents
- **Rotation**: Automatic log rotation to manage storage

## 🔍 Security Monitoring

### Rate Limit Monitoring

Monitor for:

- Frequent rate limit violations from specific IPs
- Patterns indicating automated attacks
- Legitimate users hitting limits (adjust if needed)

### Authentication Monitoring

Track:

- Failed login attempts
- Unusual login patterns
- Token usage anomalies
- Password reset abuse

### System Monitoring

Monitor:

- API response times under load
- Error rates and patterns
- Database query performance
- Resource utilization

## 🚨 Incident Response

### Security Incident Handling

1. **Detection**: Automated alerts for security events
2. **Assessment**: Rapid evaluation of threat severity
3. **Containment**: Immediate measures to limit impact
4. **Recovery**: System restoration and security patches
5. **Documentation**: Incident logging and lessons learned

### Emergency Procedures

- **Rate Limit Bypass**: Emergency admin access procedures
- **Account Lockout**: Administrative account recovery
- **System Compromise**: Incident escalation procedures

## 🔧 Security Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# Database Security
DATABASE_URL=postgresql://user:password@localhost/pairflix
DB_SSL_MODE=require

# CORS Configuration
ALLOWED_ORIGINS=https://app.pairflix.com,https://admin.pairflix.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security Headers
ENABLE_SECURITY_HEADERS=true
ENABLE_CORS=true
```

### Production Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] HTTPS enforced on all endpoints
- [ ] Database connections encrypted
- [ ] Environment variables secured
- [ ] Rate limiting configured appropriately
- [ ] Audit logging enabled
- [ ] Error handling doesn't leak sensitive information
- [ ] Security headers configured
- [ ] CORS restricted to known origins
- [ ] Regular security updates applied

## 🔄 Security Updates

### Update Policy

- **Critical Security Patches**: Immediate deployment
- **Regular Updates**: Monthly security review and updates
- **Dependency Updates**: Regular dependency security audits
- **Penetration Testing**: Quarterly security assessments

### Vulnerability Management

1. **Detection**: Automated vulnerability scanning
2. **Assessment**: Risk evaluation and prioritization
3. **Patching**: Timely application of security patches
4. **Verification**: Post-patch security validation

## 📚 Security Resources

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Internal Documentation

- [API Documentation](../../api-docs.md)
- [Database Schema](../../db-schema.md)
- [Deployment Guide](../../prd.md)
- [Backend README](../README.md)
- [Middleware Documentation](../src/middlewares/README.md)

---

**Security is everyone's responsibility. Report security issues immediately to the development team.**
