---
name: new-backend-feature
description: Use when adding a new domain to the Pairflix backend (a new resource with its own routes, controller, service, model, and tests). Walks through the layering, registration, and migration steps so the feature lands on all the right seams.
---

# Adding a new backend feature

Pairflix backend layers are: **routes → controllers → services → models**. Every new domain follows the same shape so the codebase stays grep-able. This skill assumes you have a domain name (e.g. `recommendation`) and know the endpoints you want to expose.

## 1. Model + migration first

If the feature owns persistent state:

1. Create `backend/src/models/<PascalCase>.ts`. Use TypeScript enums for status fields. JSONB for flexible payloads. Indexes on every column you'll filter on.
2. Register the model in `backend/src/models/index.ts` (both the import + the `models` map). Define associations next to the other association blocks.
3. Add a migration at `backend/src/db/migrations/<NNN>-<verb>-<name>.ts` with **both `up` and `down`** wrapped in a transaction. Number sequentially.
4. Update `docs/db-schema.md` in the same change.

## 2. Service

`backend/src/services/<domain>.service.ts` — all business logic. Pure-ish; no `req`/`res`. Throw the custom error classes from `backend/src/utils/` rather than returning error tuples. Co-locate `<domain>.service.test.ts`.

Service test minimum: one happy path + one failure mode.

## 3. Controller

`backend/src/controllers/<domain>.controller.ts` — thin. Parse `req`, call service, send response with status. No business logic, no Sequelize calls.

```ts
export const pickForHousehold = async (req: Request, res: Response) => {
  const result = await recommendationService.pickForHousehold({
    householdId: req.params.id,
    ...req.body,
  });
  res.status(200).json({ data: result });
};
```

## 4. Routes

`backend/src/routes/<domain>.routes.ts` — wire middleware + controller. Mount auth explicitly on protected routes.

```ts
const router = Router();
router.post('/:id/pick', authMiddleware, pickForHousehold);
export default router;
```

Register the router in `backend/src/app.ts` under `/api/v1/<plural>`.

## 5. Types

If the domain has request/response DTOs, add them to `backend/src/types/index.ts` (or a domain-specific file alongside it).

## 6. Verify

```bash
cd backend && npx tsc --noEmit
cd backend && npm run test -- <domain>
```

Both must pass before you commit.

## Anti-patterns to avoid

- Sequelize calls in the controller — push them into the service.
- New top-level folders. The four-layer convention is load-bearing.
- Adding `try/catch` in the controller just to re-throw. The error middleware handles it.
- Skipping the migration and calling `sync({ alter: true })`. Migrations are mandatory after Phase A.
- Adding endpoints without auth middleware "because it's internal". Mount explicitly.
