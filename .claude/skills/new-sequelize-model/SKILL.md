---
name: new-sequelize-model
description: Use when adding a new Sequelize model (table) to the Pairflix backend. Covers the model file, registration in models/index.ts, the migration, associations, and the docs/db-schema.md update — the four things that are easy to forget individually.
---

# Adding a new Sequelize model

Every new table needs four artefacts. Skipping any one of them breaks something at merge time.

## 1. The model file

`backend/src/models/<PascalCase>.ts`. Template (matches `Match.ts`, `WatchlistEntry.ts`):

```ts
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../db';

export enum HouseholdRole {
  OWNER = 'owner',
  MEMBER = 'member',
}

type Attributes = {
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreationAttributes = Optional<
  Attributes,
  'id' | 'createdAt' | 'updatedAt' | 'name'
>;

export class Household
  extends Model<Attributes, CreationAttributes>
  implements Attributes
{
  declare id: string;
  declare name: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Household.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: 'households', timestamps: true, underscored: true }
);
```

Rules:

- Tabs for indentation in `backend/`.
- Enums for status / kind / role.
- JSONB for flexible payloads (`weights`, `providers`, settings).
- `timestamps: true, underscored: true` unless there's a reason not to.
- Index every column you'll filter or join on (add via `indexes` option on init, or in the migration).

## 2. Register in `models/index.ts`

Two edits:

1. Import the model and re-export it from the file.
2. Add associations in the same file, in the existing association block:

```ts
User.belongsToMany(Household, {
  through: HouseholdMember,
  foreignKey: 'user_id',
});
Household.belongsToMany(User, {
  through: HouseholdMember,
  foreignKey: 'household_id',
});
Household.hasMany(WatchedTogether, { foreignKey: 'household_id' });
```

If you forget this, the model exists but nothing else can use it.

## 3. The migration

`backend/src/db/migrations/<NNN>-<verb>-<name>.ts`. Sequential numbering. Both `up` and `down`. Transactional.

```ts
import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'households',
        {
          id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
          },
          name: { type: DataTypes.STRING, allowNull: true },
          created_at: { type: DataTypes.DATE, allowNull: false },
          updated_at: { type: DataTypes.DATE, allowNull: false },
        },
        { transaction: t }
      );
      await queryInterface.addIndex('households', ['name'], { transaction: t });
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('households');
  },
};
```

Backfills (e.g. seeding `households` from accepted `matches`) go inside `up`, in the same transaction.

Test `up` and `down` against a clean local Postgres before committing.

## 4. Update `docs/db-schema.md`

Add the new table to the schema doc in the same change. Match the existing column-table format. If you skip this, the next agent will assume the table doesn't exist.

## Verify

```bash
cd backend && npx tsc --noEmit
cd backend && npm test
```

Both must pass.

## Anti-patterns

- Modifying an existing migration. **Always** add a new one.
- Forgetting `down`. Half a migration is worse than none.
- Defining associations inside the model file instead of `models/index.ts`. Breaks the load order.
- Adding `sync({ alter: true })` "just for dev". Migrations are mandatory.
- Naming the file by feature (`add-pick.ts`) instead of by table change (`007-create-households.ts`). The latter is greppable.
