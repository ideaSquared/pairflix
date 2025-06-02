# Component Library Migration Guide

## Overview

This document outlines the process for migrating component usage from app-specific implementations to the shared component library. The PairFlix application previously had duplicate component implementations in `app.client` and `app.admin`. We are standardizing on the shared component library in `lib.components` to:

1. Reduce code duplication
2. Ensure UI consistency across applications
3. Centralize component maintenance
4. Improve developer experience

## Components Being Migrated

The following components are being standardized through `@pairflix/components`:

- Alert
- Badge
- Button
- Card
- ErrorBoundary
- FilterGroup
- Input
- Layout (Container, Row, Column, etc.)
- Loading
- Modal
- Pagination
- Select
- Table/DataTable
- Tabs
- Textarea
- Typography (H1, H2, Paragraph, etc.)

## App-Specific Components (Not Being Migrated)

The following components will remain app-specific:

- DocumentTitle - Manages document title based on application context
- FeatureToggle - Controls feature flag visibility
- MaintenanceMode - Application-specific maintenance handling
- QueryErrorBoundary - TanStack Query error handling
- SessionManager - Authentication session management
- TagFilter - Domain-specific tag filtering functionality
- TagInput - Domain-specific tag input functionality
- RouteDebug (admin only) - Admin-specific route debugging
- TestComponent (admin only) - Admin-specific testing component
- QueryErrorBoundary
- RouteDebug
- SessionManager
- TestComponent

## Migration Process

### Automated Migration

We've created a migration script to automate most of the process:

```bash
# To run the migration script:
node ./scripts/migrate-components.js
```

The script:

1. Verifies components exist in the component library
2. Scans both applications for component imports
3. Updates imports to use `@pairflix/components`
4. Consolidates multiple imports from the shared library

### Manual Steps

After running the migration script:

1. Install dependencies in both apps:

   ```bash
   cd app.client
   npm install

   cd ../app.admin
   npm install
   ```

2. Test the applications to ensure components work correctly

3. Remove the duplicate component files:
   ```bash
   # Remove migrated component files (keep app-specific ones)
   rm -f app.client/src/components/common/{Alert,Badge,Button,Card,ErrorBoundary,FilterGroup,Input,Layout,Loading,Modal,Pagination,Select,Table,Tabs,Textarea,Typography}.tsx
   rm -f app.admin/src/components/common/{Alert,Badge,Button,Card,ErrorBoundary,FilterGroup,Input,Layout,Loading,Modal,Pagination,Select,Table,Tabs,Textarea,Typography}.tsx
   ```

## Troubleshooting

Common issues during migration:

### Type Errors

If you encounter type errors:

- Check if prop interfaces differ between app-specific and shared components
- Update component usage to match the shared component API
- Consider adding type assertions where necessary as a temporary solution

### Missing Components

If a component is reported as not found in the library:

- Verify the component is exported in `lib.components/src/index.ts`
- Check for capitalization differences
- Ensure the component is properly exported from its source file

### Styling Differences

If components look different after migration:

- Check for theme differences between apps
- Verify styled-component theme providers are configured correctly
- Look for app-specific overrides that might need to be retained

### Special Cases

Some components require special attention:

- **ThemeProvider**: Make sure theme tokens are consistent between apps and the component library
- **ErrorBoundary**: Update with app-specific error handling if needed
- **QueryErrorBoundary**: Keep app-specific implementation but ensure it uses shared UI components

## Future Considerations

- Document each component in the shared library with usage examples
- Add visual regression tests to ensure consistent appearance across apps
- Set up a versioning and release strategy for the component library
- Consider implementing a Storybook instance for component documentation and visual testing
- Add automated tests to prevent component duplication in the future

```

## Future Considerations

1. **Component Documentation**: Create detailed documentation for shared components
2. **Versioning Strategy**: Set up semantic versioning for the component library
3. **Storybook Integration**: Consider adding Storybook for component visualization and testing
4. **Theme Consistency**: Ensure consistent theming across apps
```
