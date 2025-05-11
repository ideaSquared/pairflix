# COPILOT EDITS OPERATIONAL GUIDELINES

## PRIME DIRECTIVE

    Avoid working on more than one file at a time.
    Multiple simultaneous edits to a file will cause corruption.
    Be chatting and teach about what you are doing while coding.

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

Here is your **TypeScript Requirements** specification in **Markdown format**:

---

````markdown
# TypeScript Requirements

## Target Version

- TypeScript 5.x or higher

## Features to Use

- ✅ Native ECMAScript modules (`import` / `export`)
- ✅ `readonly` class properties where appropriate
- ✅ `as const` for literal value narrowing
- ✅ Prefer union types over `enum`, unless `enum` semantics are required
- ✅ Optional chaining (`?.`) and nullish coalescing (`??`)
- ✅ Constructor parameter properties:

  ```ts
  constructor(public readonly id: string) {}
  ```
````

````

- ✅ Discriminated unions for polymorphism
- ✅ Exhaustive `switch` checks using `never`
- ✅ Strict null checks and strict property initialization
- ✅ Utility types like `Partial<T>`, `Pick<T, K>`, `Record<K, V>`, etc.
- ✅ Top-level `await`, `satisfies` keyword, `infer` usage in generics
- ✅ Decorators (if enabled via `experimentalDecorators`)

## Compiler Settings (`tsconfig.json`)

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "ESNext",
		"strict": true,
		"noUncheckedIndexedAccess": true,
		"exactOptionalPropertyTypes": true,
		"useUnknownInCatchVariables": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"skipLibCheck": true
	}
}
```

## Code Quality & Standards

- Follow [Airbnb TypeScript Style Guide](https://github.com/iamturns/eslint-config-airbnb-typescript) or similar
- Format consistently using [Prettier](https://prettier.io/)
- Use `eslint` with `@typescript-eslint` plugin
- Prefer composition over inheritance
- Use dependency injection for all external dependencies
- Enforce immutability and pure functions in business logic
- Avoid use of `any` — prefer `unknown` with proper type guards

## Static Analysis

- Enable all strict TypeScript checks
- Use schema validation libraries like [Zod](https://github.com/colinhacks/zod) or [io-ts](https://github.com/gcanti/io-ts)
- Use `ts-prune` to detect unused exports
- Run `tsc` and `eslint` in CI pipelines

## Error Handling

- Do not suppress errors with `// @ts-ignore` unless absolutely necessary and well-commented
- Use custom error classes extending `Error`:

  ```ts
  class InvalidInputError extends Error {
  	constructor(message: string) {
  		super(message);
  		this.name = 'InvalidInputError';
  	}
  }
  ```

- Use `unknown` in `catch` and refine via `instanceof` or custom type guards
- Handle only known and expected error cases

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

    Follow this monorepo directory layout:

    	project-root/
    	├── backend/              # Node.js/TypeScript backend service
    	│   ├── src/
    	│   │   ├── controllers/  # Request handlers and business logic
    	│   │   ├── db/          # Database connection and seeders
    	│   │   ├── middlewares/ # Express middlewares
    	│   │   ├── models/      # Data models and schemas
    	│   │   ├── routes/      # API route definitions
    	│   │   ├── services/    # Business logic services
    	│   │   ├── tests/      # Test helpers and setup
    	│   │   ├── types/      # TypeScript type definitions
    	│   │   └── utils/      # Utility functions and helpers
    	│   ├── Dockerfile      # Backend container definition
    	│   └── package.json    # Backend dependencies
    	├── frontend/            # React/TypeScript frontend application
    	│   ├── src/
    	│   │   ├── components/ # Reusable UI components
    	│   │   ├── features/   # Feature-specific components and logic
    	│   │   ├── hooks/      # Custom React hooks
    	│   │   ├── services/   # API client and services
    	│   │   ├── styles/     # Global styles and theming
    	│   │   └── tests/      # Test setup and mocks
    	│   ├── Dockerfile      # Frontend container definition
    	│   └── package.json    # Frontend dependencies
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

```

```
````
