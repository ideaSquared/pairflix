# 🧪 Testing Strategy

This document outlines the testing approach for the PairFlix application.

## Testing Principles

- **Test Pyramid**: We follow the test pyramid approach with more unit tests than integration tests, and fewer end-to-end tests.
- **Test Coverage**: We aim for >80% code coverage across the codebase.
- **Test-Driven Development**: Critical features should be developed using TDD when possible.
- **Continuous Testing**: Tests run on every commit via CI/CD pipeline.

## Test Types

### Unit Tests

Unit tests verify that individual components work as expected in isolation.

**Backend Unit Tests**:

- Service layer logic
- Helper functions and utilities
- Data transformation functions
- Validation logic

**Frontend Unit Tests**:

- Component rendering
- Hook behavior
- State management
- Helper functions

### Integration Tests

Integration tests verify that different parts of the system work together correctly.

**Backend Integration Tests**:

- API endpoint functionality
- Database interactions
- Authentication flow
- External API integration (TMDb)

**Frontend Integration Tests**:

- User workflows across multiple components
- Form submissions and validations
- API service interactions
- State updates across components

### End-to-End Tests

E2E tests verify complete user journeys through the application.

**Key E2E Test Scenarios**:

- User authentication flow
- Adding and managing watchlist items
- Searching for content
- Matching and recommendation flows

## Testing Tools

### Backend Testing Stack

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library
- **Mock Service Worker**: API mocking
- **Testcontainers**: Database testing

### Frontend Testing Stack

- **Jest**: Test runner
- **React Testing Library**: Component testing
- **Mock Service Worker**: API mocking
- **Vitest**: Fast test runner for Vite projects

## Testing Patterns

### Backend Testing Patterns

1. **Controller Tests**

   - Mock service layer
   - Verify HTTP responses
   - Test error handling

   Example:

   ```typescript
   describe('AuthController', () => {
   	it('should return 401 for invalid credentials', async () => {
   		// Test implementation
   	});
   });
   ```

2. **Service Tests**

   - Mock database and external APIs
   - Focus on business logic
   - Test edge cases

3. **Model Tests**
   - Test validation rules
   - Test relationships
   - Test custom methods

### Frontend Testing Patterns

1. **Component Tests**

   - Render component in isolation
   - Verify correct output based on props
   - Test user interactions

   Example:

   ```typescript
   test('Button renders correctly with props', () => {
   	render(<Button label='Click me' />);
   	expect(screen.getByText('Click me')).toBeInTheDocument();
   });
   ```

2. **Hook Tests**

   - Test custom hooks in isolation
   - Verify state changes
   - Test side effects

3. **Form Tests**
   - Test validation logic
   - Test form submission
   - Test error states

## Mock Strategies

### API Mocking

We use Mock Service Worker (MSW) to intercept and mock API requests:

```typescript
// Example MSW setup
rest.get('/api/v1/watchlist', (req, res, ctx) => {
	return res(
		ctx.status(200),
		ctx.json({
			entries: [
				{
					id: '123',
					tmdbId: 550,
					mediaType: 'movie',
					status: 'to_watch',
				},
			],
			total: 1,
		})
	);
});
```

### Database Mocking

For database tests, we use:

- In-memory SQLite for unit tests
- Test containers for integration tests

## Test Data Management

- Factory functions to generate test data
- Shared fixtures for common test scenarios
- Database seeding for integration tests

Example test data factory:

```typescript
const createUser = (overrides = {}) => ({
	id: '123e4567-e89b-12d3-a456-426614174000',
	username: 'testuser',
	email: 'test@example.com',
	...overrides,
});
```

## Continuous Integration

Tests run in CI on:

- Pull request creation
- Updates to pull requests
- Merges to main branch

The CI pipeline:

1. Installs dependencies
2. Runs linting checks
3. Executes unit tests
4. Executes integration tests
5. Generates coverage report

## Test Organization

### Backend Test Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.test.ts
│   │   ├── auth.controller.ts
│   │   └── ...
│   ├── services/
│   │   ├── auth.service.test.ts
│   │   ├── auth.service.ts
│   │   └── ...
│   └── ...
├── tests/
│   ├── integration/
│   │   ├── auth.integration.test.ts
│   │   └── ...
│   ├── fixtures/
│   │   ├── users.ts
│   │   └── ...
│   └── setup.ts
```

### Frontend Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── Button.test.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── features/
│   │   ├── auth/
│   │   │   ├── __tests__/
│   │   │   │   ├── LoginPage.test.tsx
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── tests/
│   ├── e2e/
│   │   ├── auth.e2e.test.ts
│   │   └── ...
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── ...
│   └── setup.ts
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests.
2. **Readability**: Tests should be easy to read and understand.
3. **Maintainability**: Tests should be easy to maintain and update.
4. **Speed**: Tests should run quickly to provide fast feedback.
5. **Focus**: Each test should focus on testing one thing.

## Test Documentation

- Test files should include a brief description of what they test
- Complex test cases should include comments explaining the setup and assertions
- Test fixtures should be documented with their purpose and structure
