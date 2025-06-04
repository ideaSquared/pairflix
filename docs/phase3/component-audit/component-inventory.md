# PairFlix Component Inventory

_Created: June 3, 2025_
_Phase 3: Component Library Standardization_

## Purpose

This document provides a comprehensive inventory of UI components across the PairFlix ecosystem:

- Shared component library (`lib.components`)
- Client application (`app.client`)
- Admin application (`app.admin`)

The inventory serves as a foundation for our component standardization efforts in Phase 3.

## Inventory Structure

Each component is categorized by:

- **Component Name**: The name of the component
- **Location**: Where the component currently exists (`lib.components`, `app.client`, `app.admin`)
- **Type**: The type of component (Button, Input, Card, Layout, etc.)
- **Duplicate Status**: Whether this component is duplicated across apps
- **Migration Status**: Current status in the standardization process
- **Standardization Priority**: How urgent it is to standardize this component (High/Medium/Low)
- **Notes**: Additional observations or requirements

## Component Inventory

| Component Name                  | Location       | Type         | Duplicate Status        | Migration Status | Standardization Priority | Notes                                             |
| ------------------------------- | -------------- | ------------ | ----------------------- | ---------------- | ------------------------ | ------------------------------------------------- |
| **Common Components**           |                |              |                         |                  |                          |                                                   |
| Alert                           | lib.components | Feedback     | No                      | Complete         | -                        | Shared component, already standardized            |
| Badge                           | lib.components | Display      | No                      | Complete         | -                        | Shared component, already standardized            |
| Button                          | lib.components | Input        | Duplicate in app.client | Partial          | High                     | Need to merge app.client variant with lib version |
| Card                            | lib.components | Layout       | Duplicate in app.admin  | Partial          | High                     | Need to standardize props between versions        |
| ErrorBoundary                   | lib.components | Utility      | No                      | Complete         | -                        | Error handling component                          |
| FilterGroup                     | lib.components | Filter       | No                      | Complete         | -                        | Used for content filtering                        |
| Input                           | lib.components | Form         | Duplicate in both apps  | Not Started      | High                     | Multiple implementations with different props     |
| Layout                          | lib.components | Layout       | Duplicate in both apps  | Not Started      | High                     | Need to create composable layout system           |
| Loading                         | lib.components | Feedback     | No                      | Complete         | -                        | Loading indicator                                 |
| Modal                           | lib.components | Overlay      | Duplicate in app.admin  | Partial          | Medium                   | Admin has enhanced modal with different API       |
| Pagination                      | lib.components | Navigation   | No                      | Complete         | -                        | Shared pagination component                       |
| Select                          | lib.components | Form         | Duplicate in app.client | Not Started      | High                     | Different implementations, need standardization   |
| Table                           | lib.components | Data Display | Duplicate in both apps  | In Progress      | High                     | Migration to DataTable in progress                |
| Tabs                            | lib.components | Navigation   | No                      | Complete         | -                        | Tab navigation component                          |
| Textarea                        | lib.components | Form         | No                      | Complete         | -                        | Multiline text input                              |
| Typography                      | lib.components | Text         | No                      | Complete         | -                        | Text components (h1-h6, p, etc.)                  |
| **Client Application Specific** |                |              |                         |                  |                          |                                                   |
| MatchCard                       | app.client     | Feature      | No                      | N/A              | Low                      | App-specific feature component                    |
| MediaPoster                     | app.client     | Media        | No                      | N/A              | Low                      | Specialized for media display                     |
| ProfileSelector                 | app.client     | User         | No                      | N/A              | Low                      | User profile management                           |
| RatingStars                     | app.client     | Input        | No                      | Candidate        | Medium                   | Could be reused in admin app                      |
| SearchBar                       | app.client     | Search       | Duplicate in app.admin  | Not Started      | Medium                   | Similar functionality, different implementation   |
| TagSelector                     | app.client     | Input        | No                      | N/A              | Low                      | Specialized for client app                        |
| WatchlistItem                   | app.client     | Feature      | No                      | N/A              | Low                      | App-specific feature component                    |
| **Admin Application Specific**  |                |              |                         |                  |                          |                                                   |
| ActivityChart                   | app.admin      | Data Viz     | No                      | N/A              | Low                      | Admin-specific analytics                          |
| AdminHeader                     | app.admin      | Layout       | No                      | Candidate        | Medium                   | Could be generalized                              |
| ContentModerationCard           | app.admin      | Feature      | No                      | N/A              | Low                      | Specialized for content moderation                |
| DataGrid                        | app.admin      | Data Display | No                      | Candidate        | Medium                   | Enhanced table with filtering                     |
| LogViewer                       | app.admin      | Data Display | No                      | N/A              | Low                      | Specialized log display                           |
| MetricsCard                     | app.admin      | Data Viz     | No                      | N/A              | Low                      | Analytics display                                 |
| SideNav                         | app.admin      | Navigation   | No                      | Candidate        | Medium                   | Could be part of layout system                    |
| StatusIndicator                 | app.admin      | Feedback     | No                      | Candidate        | High                     | Could be reused in client app                     |
| UserRoleSelector                | app.admin      | Admin        | No                      | N/A              | Low                      | Admin-specific feature                            |

## Duplication Analysis Summary

Based on the inventory, these components are duplicated and require standardization:

1. **Button** - Exists in lib.components and app.client
2. **Card** - Exists in lib.components and app.admin
3. **Input** - Multiple implementations across all three locations
4. **Layout** - Different implementations across all applications
5. **Modal** - Different implementations in lib.components and app.admin
6. **Select** - Different implementations in lib.components and app.client
7. **Table/DataTable** - Currently being migrated to a standardized DataTable
8. **SearchBar** - Similar functionality in both apps with different implementations

## Next Steps

1. Analyze each duplicated component to understand differences in:

   - Props/API surface
   - Styling and theming
   - Behavior and functionality
   - Accessibility implementations

2. Define standardized API patterns for:

   - Common prop naming conventions
   - Consistent event handling
   - Theme integration
   - Accessibility patterns

3. Create standardization plan with priorities:

   - High: Button, Input, Card, Layout, Table/DataTable
   - Medium: Modal, Select, SearchBar, StatusIndicator
   - Low: App-specific components

4. Design shared component architecture:
   - Organization structure
   - Documentation approach
   - Testing strategy
   - Migration process
