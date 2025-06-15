# Groups Feature - Component Architecture

This document outlines the refactored component structure for the Groups feature, following React best practices and principles.

## 📁 Directory Structure

```
src/features/groups/
├── components/
│   ├── ui/                     # Small, focused UI components
│   │   ├── GroupHeader.tsx     # Group card header with icon, title, badges
│   │   ├── GroupStats.tsx      # Member count and date information
│   │   ├── GroupCreator.tsx    # Creator avatar and info
│   │   ├── GroupSchedule.tsx   # Schedule badge display
│   │   ├── GroupDescription.tsx # Group description text
│   │   ├── GroupActionHint.tsx # "Click to view details" hint
│   │   └── index.ts           # UI components exports
│   ├── forms/                  # Form-specific components
│   │   ├── GroupTypeSelector.tsx    # Group type selection UI
│   │   ├── GroupSettingsSection.tsx # Settings checkboxes and preview
│   │   └── index.ts                # Form components exports
│   ├── layout/                 # Layout and grid components
│   │   ├── GroupsGrid.tsx      # Responsive grid layout for groups
│   │   └── index.ts           # Layout components exports
│   ├── GroupCard.tsx          # Main group card (composed of UI components)
│   ├── GroupDetailPage.tsx    # Group detail page
│   ├── CreateGroupForm.tsx    # Group creation form
│   ├── CreateRelationshipForm.tsx # Relationship creation form
│   ├── GroupInvitations.tsx   # Group invitations component
│   └── index.ts              # Main components exports
├── utils/
│   └── groupHelpers.ts        # Utility functions for group logic
├── hooks/                     # Custom hooks
├── pages/                     # Page components
└── index.ts                  # Feature exports
```

## 🎯 Design Principles Applied

### 1. **Single Responsibility Principle**

Each component has one clear purpose:

- `GroupHeader` - Only handles header display
- `GroupStats` - Only handles stats display
- `GroupTypeSelector` - Only handles type selection

### 2. **Component Composition**

Large components are composed of smaller, reusable parts:

```tsx
// Before: One large GroupCard with everything inline
<GroupCard>
  {/* 300+ lines of mixed concerns */}
</GroupCard>

// After: Composed of focused components
<GroupCard>
  <GroupHeader group={group} />
  <GroupDescription group={group} />
  <GroupStats group={group} />
  <GroupCreator group={group} />
  <GroupSchedule group={group} />
  <GroupActionHint show={!onClick} />
</GroupCard>
```

### 3. **Separation of Concerns**

- **UI Components** (`/ui/`) - Pure presentation, no business logic
- **Form Components** (`/forms/`) - Form-specific logic and validation
- **Layout Components** (`/layout/`) - Responsive layouts and grids
- **Utils** (`/utils/`) - Pure functions for data transformation
- **Main Components** - Orchestration and data flow

### 4. **Reusability**

Components are designed to be reusable across different contexts:

- `GroupsGrid` can be used anywhere groups need to be displayed
- `GroupHeader` can be used in cards, lists, or detail views
- Form components can be composed into different form layouts

### 5. **Prop Interface Design**

Clear, minimal prop interfaces:

```tsx
// Focused, single-purpose props
interface GroupHeaderProps {
  group: Group;
}

// Flexible, reusable props
interface GroupActionHintProps {
  show: boolean;
}
```

## 🔧 Utility Functions

Extracted common logic into pure utility functions:

```tsx
// groupHelpers.ts
export const getGroupTypeColor = (type: GroupType, theme: any): string => { ... }
export const formatMemberCount = (count: number): string => { ... }
export const formatGroupDate = (dateString: string): string => { ... }
export const getGroupDisplayName = (type: GroupType): string => { ... }
export const getBadgeVariantForStatus = (status: string) => { ... }
```

## 📦 Import Strategy

Organized exports for clean imports:

```tsx
// Import specific UI components
import { GroupHeader, GroupStats } from '../components/ui';

// Import form components
import { GroupTypeSelector, GroupSettingsSection } from '../components/forms';

// Import layout components
import { GroupsGrid } from '../components/layout';

// Import utilities
import { getGroupTypeColor, formatMemberCount } from '../utils/groupHelpers';
```

## ✅ Benefits Achieved

1. **Maintainability** - Easier to find and modify specific functionality
2. **Testability** - Small components are easier to unit test
3. **Reusability** - Components can be used in multiple contexts
4. **Readability** - Clear component hierarchy and responsibilities
5. **Performance** - Smaller components enable better React optimization
6. **Developer Experience** - Easier to understand and contribute to

## 🚀 Usage Examples

### Using the refactored GroupCard:

```tsx
import { GroupCard } from '../components';

<GroupCard
  group={group}
  onClick={handleClick} // Optional click handler
/>;
```

### Using individual UI components:

```tsx
import { GroupHeader, GroupStats } from '../components/ui';

<div>
  <GroupHeader group={group} />
  <GroupStats group={group} />
</div>;
```

### Using the grid layout:

```tsx
import { GroupsGrid } from '../components/layout';

<GroupsGrid>
  {groups.map(group => (
    <GroupCard key={group.id} group={group} />
  ))}
</GroupsGrid>;
```

This refactored architecture provides a solid foundation for future development and makes the codebase more maintainable and scalable.
