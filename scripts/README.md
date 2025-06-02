# Component Migration Scripts

This directory contains scripts to help migrate component usage from app-specific implementations to the shared component library.

## Migration Script

The main migration script (`migrate-components-fixed.js`) is used to update component imports across the PairFlix apps. This script uses direct file system traversal instead of grep to avoid path issues.

### Usage

```bash
# Migrate components in all apps
npm run migrate-components

# Migrate components in client app only
npm run migrate-components:client
# or
node ./scripts/migrate-components.js --app=client

# Migrate components in admin app only
npm run migrate-components:admin
# or
node ./scripts/migrate-components.js --app=admin
```

### What the Script Does

1. Verifies components exist in the component library
2. Finds all files that import from local components
3. Updates imports to use `@pairflix/components`
4. Consolidates multiple imports from the shared library

### After Running the Script

1. Review the changes in each app
2. Run the applications to ensure components work correctly
3. Remove duplicated component files from the apps

## Additional Information

For more details about the component migration process, see [the component migration guide](../docs/component-migration.md).

## Legacy Script

The `migrate-components.sh` is a legacy bash script that was used for the initial migration planning. It's not recommended for use on Windows environments.
