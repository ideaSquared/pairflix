# COPILOT EDITS OPERATIONAL GUIDELINES

## PRIME DIRECTIVE

    Follow project standards. Focus on one file at a time to prevent corruption. Explain your reasoning.

## LARGE FILE & COMPLEX CHANGE PROTOCOL

### MANDATORY PLANNING & EXECUTION PROTOCOL FOR AI ASSISTANT

    When handling large files (>300 lines) or complex changes, the AI assistant must follow the protocol below.

#### 📌 PHASE 1: MANDATORY PLANNING

1. **Begin with a detailed plan _before_ making any edits**
2. The plan **must include**:

   - ✅ All functions or sections that need modification
   - ✅ The order in which changes should be applied
   - ✅ Dependencies between changes
   - ✅ Estimated number of separate edits

3. Use the following format for proposed plans:

#### 🧾 PROPOSED EDIT PLAN TEMPLATE

**Working with:** `[filename]`  
**Total planned edits:** `[number]`

#### Edit Sequence:

1. `[First specific change]` — Purpose: `[why it’s needed]`
2. `[Second specific change]` — Purpose: `[why it’s needed]`
3. ...

_Do you approve this plan?_ I will proceed with **Edit [number]** after explicit user confirmation.

#### 🛠️ MAKING EDITS

- Focus on **one conceptual change at a time**
- Provide **before/after code snippets** with concise explanations
- Ensure each change matches the **project’s coding style and conventions**
- Follow **SOLID principles** and emphasize **readability and testability**
- No TODOs, placeholders, or incomplete stubs

## 🚦 EXECUTION PHASE

- After each confirmed edit, mark progress with:

```
✅ Completed edit [#] of [total]. Ready for next edit?
```

- If unexpected complexity or scope creep is discovered:
  - ⛔ Stop immediately
  - 📋 Update the edit plan
  - 📣 Wait for user approval before continuing

## 🔄 REFACTORING GUIDANCE

- Break work into **logical, independently functional chunks**
- Ensure each intermediate state is **stable and functional**
- Use **temporary duplication** if necessary to maintain continuity
- Clearly state the **refactoring pattern** used (e.g., Extract Method, Move Function)

## ⏱️ RATE LIMIT AVOIDANCE

- For large files:

  - Propose splitting changes across **multiple sessions**
  - Prioritize edits that are **logically complete**
  - Define clear **stopping points** for review and approval

  Each new feature or request must include:

- ✅ A complete **Product Requirements Document (PRD)** describing:

  - Feature summary
  - User stories or behavioral expectations
  - Acceptance criteria
  - Constraints or technical notes

- ✅ An **AI-managed decision log** noting:
  - All architectural choices
  - Trade-offs considered
  - All changes made

## General Requirements

    Use modern technologies as described below for all code suggestions. Prioritize clean, maintainable code with appropriate comments.

### Accessibility

    - Ensure compliance with **WCAG 2.1** AA level minimum, AAA whenever feasible.
    - Always suggest:
        - Labels for form fields.
        - Proper **ARIA** roles and attributes.
        - Adequate color contrast.
        - Alternative texts (`alt`, `aria-label`) for media elements.
        - Semantic HTML for clear structure.
        - Tools like **Lighthouse** for audits.

## Browser Compatibility

    - Prioritize feature detection (`if ('fetch' in window)` etc.).
        - Support latest two stable releases of major browsers:
    - Firefox, Chrome, Edge, Safari (macOS/iOS)
        - Emphasize progressive enhancement with polyfills or bundlers (e.g., **Babel**, **Vite**) as needed.

## TypeScript Requirements

- Target: TypeScript 5.x+
- Use: ESM, readonly properties, const assertions, union types over enums, optional chaining, nullish coalescing, parameter properties, discriminated unions, exhaustive checks, strict null checks, utility types
- Compiler Settings: ES2022, ESNext, strict, noUncheckedIndexedAccess, exactOptionalPropertyTypes, useUnknownInCatchVariables
- Quality Standards: Follow Airbnb Style Guide, use Prettier, ESLint with @typescript-eslint, prefer composition, dependency injection, immutability, avoid any
- Static Analysis: Use Zod/io-ts, ts-prune, run tsc/eslint in CI
- Error Handling: Custom error classes, unknown in catch blocks, handle expected errors only

## 🧱 HTML/CSS Requirements

### 📄 HTML

- ✅ Use **HTML5 semantic elements**:
  - `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<search>`, etc.
- ✅ Add **ARIA attributes** where needed to ensure accessibility (`aria-label`, `aria-hidden`, etc.)
- ✅ Ensure **valid, semantic markup** that passes **W3C HTML validation**
- ✅ Implement **responsive design** best practices
- ✅ Optimize images:
  - Use modern formats: **WebP** or **AVIF**
  - Use `loading="lazy"` for non-critical images
  - Provide `srcset` and `sizes` for **responsive image loading**
- ✅ Prioritize SEO with:
  - `<title>` tag
  - `<meta name="description">`
  - Open Graph (`<meta property="og:*">`) and Twitter Card metadata
- ✅ Use appropriate `lang` attribute on `<html>` and logical heading order (`<h1>` to `<h6>`)

### 🎨 CSS (with `styled-components`)

- ✅ Use **`styled-components`** for all styles
- ✅ Use ThemeProvider from styled-components to support light/dark theme switching
  - Define light and dark theme objects (e.g., lightTheme, darkTheme)
  - Pass them via ThemeProvider at the root of the app
  - Use prefers-color-scheme media query to determine initial theme
  - Consume theme variables via props.theme in styled components
- ✅ Utilize **CSS Grid** and **Flexbox** for layouts
- ✅ Use **CSS Custom Properties** (variables) where applicable (via `:root` or theme object)
- ✅ Implement **CSS transitions and animations** using keyframes or `transition` props
- ✅ Add **responsive design** using media queries (via `styled-components`’ `css` helper)
- ✅ Use **logical properties** like `margin-inline`, `padding-block` for better internationalization
- ✅ Leverage **modern CSS selectors**:
  - `:is()`, `:where()`, `:has()` (when browser support allows)
- ✅ Apply a consistent **naming methodology** (preferably BEM or a scoped naming convention)
- ✅ Use **CSS nesting** (via `styled-components` syntax or enabled CSS nesting config)
- ✅ Support **dark mode** with `prefers-color-scheme` media query and theme switching
- ✅ Use **modern, performant fonts**, preferably **variable fonts** (e.g., via `@font-face` or Google Fonts)
- ✅ Prefer **responsive units** like `rem`, `em`, `vh`, `vw` over `px`

## Folder Structure

    Follow this monorepo layout:

    	project-root/
    	├── backend/              # TypeScript backend
    	│   └── src/              # Source files with controllers, models, services, etc.
    	├── frontend/            # React/TypeScript frontend
    	│   └── src/             # Components, features, hooks, services, styles
    	└── docker-compose.yml   # Container orchestration

## Documentation Requirements

    - Include JSDoc comments for JavaScript/TypeScript.
    - Document complex functions with clear examples.
    - Maintain concise Markdown documentation.
    - Minimum docblock info: `param`, `return`, `throws`, `author`
    - Document all publicly exported types, classes, and functions

## Database Requirements (PostgreSQL 15+ with Sequelize 7+)

- ✅ Use **Sequelize ORM (v7+)** with full TypeScript typing (`sequelize-typescript` or raw Sequelize with manual typings)
- ✅ Prefer **explicit model definitions** with strict TypeScript types
- ✅ Leverage PostgreSQL features including:
  - JSONB columns for flexible structured data
  - Generated columns (`GENERATED ALWAYS AS (...) STORED`)
  - `STRICT` mode via Sequelize model validations and database constraints
  - Foreign key constraints to enforce relational integrity
  - `CHECK` constraints for domain rules
  - `UNIQUE` constraints for natural keys (e.g., emails)
  - `NOT NULL` constraints for required fields
  - Indexed columns for performance on filtering/sorting
- ✅ Use Sequelize migrations (`sequelize-cli` or custom scripts via Umzug) in production. IF in development make the edits directly to the schema and update the seeders.
- ✅ Use **transactional writes** for any multi-step create/update/delete operations:

  ```ts
  await sequelize.transaction(async (t) => {
  	await User.create(data, { transaction: t });
  	await Profile.create(profileData, { transaction: t });
  });
  ```

- ✅ Always define associations explicitly with `onDelete` and `onUpdate` rules (`CASCADE`, `SET NULL`, etc.)
- ✅ Prefer UUIDs (`DataTypes.UUID`) over incremental IDs for distributed safety
- ✅ Use timestamps (`createdAt`, `updatedAt`) consistently and automatically
- ✅ Enable and test **foreign key constraints** (ensure `REFERENCES` and `ON DELETE`/`ON UPDATE` are honored)
- ✅ Validate schema with runtime checks using Zod or class-validator alongside Sequelize's validation layer
- ✅ Run integration tests using in-memory PostgreSQL (e.g., via [pg-mem](https://github.com/oguimbal/pg-mem)) or a Dockerized local Postgres instance

## Security Considerations

- Sanitize all user inputs thoroughly.
- Parameterize database queries.
- Enforce strong Content Security Policies (CSP).
- Use CSRF protection where applicable.
- Ensure secure cookies (`HttpOnly`, `Secure`, `SameSite=Strict`).
- Limit privileges and enforce role-based access control.
- Implement detailed internal logging and monitoring.

## Performance Requirements

- Core Web Vitals targets: FCP < 1.5s, LCP < 2.5s, FID < 100ms, CLS < 0.1
- Loading optimizations: Code splitting, lazy loading, React.lazy/Suspense
- Image handling: WebP/AVIF formats, responsive images, lazy loading, CDNs
- Caching: Service workers, appropriate headers, client-side cache strategies

## Testing Requirements

- Coverage targets: 80% statements/functions/lines, 75% branches
- Unit testing: Jest for backend, React Testing Library for frontend
- Integration testing: API endpoints, database operations, authentication flows
- E2E testing: Critical user journeys with Playwright
- Test data: Factories, cleanup, mocks, appropriate environments

## API Standards

- REST design: Proper HTTP methods, status codes, plural nouns, versioning
- Documentation: OpenAPI/Swagger, examples, error documentation
- Security: Rate limiting, CORS policies, authentication, authorization

## State Management

- Frontend patterns: Context for global state, Redux/Zustand for complex state, React Query for server state
- Data fetching: React Query/SWR, retry logic, cache invalidation, prefetching
- Error boundaries: Route-level implementation, fallback UIs, reporting

## Error Handling

- Error classification: API, validation, authentication, network, runtime
- Implementation: Custom classes, global handlers, recovery strategies
- Logging: Structured format, context preservation, appropriate levels

## Enhanced Accessibility Requirements

    - Keyboard Navigation:
        - Focus management
        - Focus trapping in modals
        - Skip links
        - Keyboard shortcuts
        - Focus indicators

    - Screen Reader Support:
        - ARIA landmarks
        - Live regions
        - Descriptive headings
        - Alternative text
        - Status messages

    - Focus Management:
        - Return focus after actions
        - Maintain focus order
        - Handle modal focus
        - Focus restoration
        - Error focus

## Container Orchestration

- Docker-compose configurations:

  - Use named volumes for data persistence
  - Implement health checks for all services
  - Set appropriate restart policies (unless-stopped)
  - Use environment files (.env) for configuration
  - Define memory/CPU limits for production

- Container standards:

  - Multi-stage builds to minimize image size
  - Non-root user execution for security
  - Proper signal handling (SIGTERM, SIGINT)
  - Use specific version tags, not latest
  - Use .dockerignore to reduce context size

- Environment configurations:
  - Development: Hot reloading, debug tools, volume mounts
  - Production: Optimized builds, minimal dependencies
  - Testing: In-memory databases, mock services
  - Staging: Production-like with sanitized data

## CI/CD Requirements

- GitHub Actions workflows:

  - Lint, build, test on pull requests
  - Security scanning with CodeQL
  - Docker image building and pushing
  - Automatic deployments to staging
  - Manual approval for production

- Deployment strategies:

  - Blue-green deployments for zero downtime
  - Feature flags for controlled rollouts
  - Automatic rollback on failure
  - Database migration safety checks
  - Environment variable validation

- Monitoring:
  - Health check endpoints
  - Prometheus metrics collection
  - Logging with structured JSON format
  - Error tracking integration (Sentry)
  - Performance monitoring (New Relic/Datadog)

## Internationalization (i18n)

- Translation management:

  - Use React-i18next or similar library
  - Implement locale detection and switching
  - Extract strings with context information
  - Support pluralization rules
  - Handle fallback locales gracefully

- Format considerations:

  - Use Intl API for dates, numbers, currencies
  - Support RTL layouts with logical properties
  - Implement locale-specific sorting
  - Consider cultural differences in UX
  - Test with pseudo-localization

- Implementation:
  - Lazy-load translation files
  - Implement language switcher
  - Persist language preference
  - Support locale in URLs
  - Handle dynamic content translation

## Peer Review Guidelines

- Process:

  - Maximum PR size of 400 lines
  - Required CI checks passing
  - Documentation updated
  - Tests covering new functionality
  - Security considerations addressed

- Review checklist:

  - Performance impact assessment
  - Accessibility compliance
  - Security vulnerability check
  - Error handling verification
  - Browser compatibility validation

- Coding standards:
  - No commented-out code
  - Consistent naming conventions
  - Function length < 50 lines
  - File length < 300 lines
  - Use of approved dependencies only

## Enhanced Security Requirements

- Authentication:

  - JWT with short expiry (15-60 minutes)
  - Refresh token rotation
  - Multi-factor authentication support
  - Account lockout after failed attempts
  - Password policy enforcement

- Data protection:

  - PII encryption at rest
  - Transport layer security (TLSv1.3)
  - API keys rotation strategy
  - Secrets management (no hardcoded values)
  - Data anonymization for non-production

- Attack prevention:
  - XSS prevention with Content-Security-Policy
  - SQL injection protection
  - CSRF token implementation
  - Rate limiting with token bucket algorithm
  - Input validation with schema validation
