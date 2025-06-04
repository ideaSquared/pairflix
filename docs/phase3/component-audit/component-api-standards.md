# Component API Standards

_Created: June 3, 2025_
_Phase 3: Component Library Standardization_

## Overview

This document defines standardized API patterns for all PairFlix components. These standards ensure consistency across the component library and improve developer experience.

## Component Props Convention

### Naming Patterns

| Pattern              | Description                   | Example                          |
| -------------------- | ----------------------------- | -------------------------------- |
| `ComponentNameProps` | Interface for component props | `ButtonProps`, `CardProps`       |
| `on{Event}`          | Event handler props           | `onClick`, `onFocus`, `onSubmit` |
| `aria-*`             | Accessibility attributes      | `aria-label`, `aria-describedby` |
| `data-testid`        | Test selectors                | `data-testid="submit-button"`    |

### Common Props

All components should support these common props when appropriate:

```typescript
interface BaseComponentProps {
	// Core styling
	className?: string;
	style?: React.CSSProperties;

	// Accessibility
	'aria-label'?: string;
	'aria-labelledby'?: string;
	'aria-describedby'?: string;
	tabIndex?: number;

	// Testing
	'data-testid'?: string;

	// Theme variants
	variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
	size?: 'small' | 'medium' | 'large';

	// States
	disabled?: boolean;
	isLoading?: boolean;
	isActive?: boolean;
	isFocused?: boolean;

	// All HTML attributes should be allowed to pass through
	[key: string]: any;
}
```

### Standard Variants

Consistent variants across components:

| Variant     | Description               | Use Case                                  |
| ----------- | ------------------------- | ----------------------------------------- |
| `primary`   | Main variant, brand color | Key actions, primary CTAs                 |
| `secondary` | Alternative style         | Secondary actions                         |
| `tertiary`  | Subtle variant            | Less important actions                    |
| `ghost`     | Minimal styling           | Toolbar actions, compact UIs              |
| `outline`   | Bordered variant          | Alternative to ghost with more visibility |
| `link`      | Appears as a text link    | Navigation-style actions                  |

### Standard Sizes

Consistent sizes across components:

| Size     | Description  | Use Case                               |
| -------- | ------------ | -------------------------------------- |
| `small`  | Compact size | Dense UIs, tight spaces                |
| `medium` | Default size | General usage                          |
| `large`  | Larger size  | Featured elements, improved visibility |

### Color Props

Consistent color props across components:

```typescript
type ColorScheme =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'error'
	| 'info';

interface ColorProps {
	colorScheme?: ColorScheme;
	textColor?: string; // Should accept theme colors or CSS colors
	backgroundColor?: string; // Should accept theme colors or CSS colors
}
```

## Event Handling

### Standardized Event Handlers

```typescript
// Use native event types
type MouseEventHandler = React.MouseEventHandler<HTMLElement>;
type ChangeEventHandler = React.ChangeEventHandler<HTMLInputElement>;

// Form and input component handlers
interface InputHandlers {
	onChange?: ChangeEventHandler;
	onFocus?: FocusEventHandler;
	onBlur?: FocusEventHandler;
}

// Interactive component handlers
interface InteractiveHandlers {
	onClick?: MouseEventHandler;
	onMouseEnter?: MouseEventHandler;
	onMouseLeave?: MouseEventHandler;
}
```

### Component-Specific Events

Form components should provide both raw DOM events and simplified value handling:

```typescript
interface InputProps extends InputHandlers {
	// Raw event
	onChange?: ChangeEventHandler;

	// Simplified handler with just the value
	onValueChange?: (value: string) => void;
}
```

## Composition Patterns

### Forwarded Refs

All components should forward refs to their underlying DOM elements:

```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(props, ref) => {
		// Implementation
	}
);
```

### Children and Render Props

Support for both children and render props when applicable:

```typescript
interface RenderProps<T> {
	children?: React.ReactNode | ((props: T) => React.ReactNode);
	render?: (props: T) => React.ReactNode;
}
```

### Compound Components

For complex components, use the Compound Component pattern:

```typescript
const Tabs = {
	Root: TabsRoot,
	List: TabsList,
	Tab: Tab,
	Panels: TabPanels,
	Panel: TabPanel,
};
```

## Type Safety

### Generic Components

Use generics for data-driven components:

```typescript
interface TableProps<T> {
	data: T[];
	columns: Column<T>[];
}

function Table<T>(props: TableProps<T>) {
	// Implementation
}
```

### Union Types for Variants

Use union types for variants instead of enums:

```typescript
// Prefer this:
type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';

// Over this:
enum ButtonVariant {
	Primary = 'primary',
	Secondary = 'secondary',
	// ...
}
```

### Polymorphic Components

For components that can render as different HTML elements:

```typescript
interface BoxProps<E extends React.ElementType = 'div'> {
	as?: E;
	// Other props
}

const Box = <E extends React.ElementType = 'div'>({
	as,
	...props
}: BoxProps<E>) => {
	const Component = as || 'div';
	return <Component {...props} />;
};
```

## Styling Integration

### Theme Integration

Components should derive their styling from the theme:

```typescript
const Button = styled.button<ButtonProps>`
	background-color: ${(props) =>
		props.theme.colors[props.colorScheme || 'primary']};
	padding: ${(props) => props.theme.spacing[props.size || 'medium']};
	font-size: ${(props) =>
		props.theme.typography.fontSize[props.size || 'medium']};
`;
```

### Style Overrides

Support for style overrides with styled-components:

```typescript
// Allow styled-components to extend our components
const Button = styled.button<ButtonProps>`
	// Base styles
`;

// Usage
const CustomButton = styled(Button)`
	border-radius: 50%;
`;
```

## Accessibility Standards

### ARIA Attributes

All components should include appropriate ARIA attributes:

- Buttons: `aria-pressed` for toggle buttons
- Inputs: `aria-invalid` for validation states
- Dropdowns: `aria-expanded`, `aria-controls`

### Keyboard Navigation

Support keyboard interaction patterns:

- Tab navigation for interactive elements
- Arrow keys for navigation within compound components
- Space/Enter for activation
- Escape for dismissal

### Focus Management

Proper focus management for interactive components:

- Focus visible styles that meet contrast requirements
- Focus trapping in modals and dialogs
- Focus restoration after modal closing

## Implementation Example

```typescript
// Button.tsx
import React from 'react';
import styled from 'styled-components';

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
	size?: 'small' | 'medium' | 'large';
	colorScheme?:
		| 'primary'
		| 'secondary'
		| 'success'
		| 'warning'
		| 'error'
		| 'info';
	isLoading?: boolean;
	isFullWidth?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
	display: ${(props) => (props.isFullWidth ? 'block' : 'inline-block')};
	width: ${(props) => (props.isFullWidth ? '100%' : 'auto')};
	padding: ${(props) => {
		switch (props.size) {
			case 'small':
				return '0.5rem 1rem';
			case 'large':
				return '1rem 2rem';
			default:
				return '0.75rem 1.5rem';
		}
	}};
	background-color: ${(props) => {
		if (props.disabled) return props.theme.colors.disabled;

		const colorScheme = props.colorScheme || 'primary';

		switch (props.variant) {
			case 'ghost':
				return 'transparent';
			case 'secondary':
				return props.theme.colors[`${colorScheme}100`];
			case 'tertiary':
				return 'transparent';
			default:
				return props.theme.colors[colorScheme];
		}
	}};
	color: ${(props) => {
		if (props.disabled) return props.theme.colors.disabledText;

		const colorScheme = props.colorScheme || 'primary';

		switch (props.variant) {
			case 'ghost':
			case 'tertiary':
				return props.theme.colors[colorScheme];
			case 'secondary':
				return props.theme.colors[`${colorScheme}800`];
			default:
				return props.theme.colors.white;
		}
	}};
	border: ${(props) => {
		const colorScheme = props.colorScheme || 'primary';

		switch (props.variant) {
			case 'tertiary':
				return `1px solid ${props.theme.colors[colorScheme]}`;
			case 'ghost':
				return 'none';
			default:
				return 'none';
		}
	}};
	border-radius: ${(props) => props.theme.borderRadius.md};
	font-weight: ${(props) => props.theme.typography.fontWeight.medium};
	font-size: ${(props) => {
		switch (props.size) {
			case 'small':
				return props.theme.typography.fontSize.sm;
			case 'large':
				return props.theme.typography.fontSize.lg;
			default:
				return props.theme.typography.fontSize.md;
		}
	}};
	cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
	transition: all 0.2s ease-in-out;

	&:hover:not(:disabled) {
		opacity: 0.9;
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 3px ${(props) => props.theme.colors.focusRing};
	}
`;

const LoadingSpinner = styled.span`
	display: inline-block;
	margin-right: 0.5rem;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	border-top-color: white;
	width: 1em;
	height: 1em;
	animation: spin 0.8s linear infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			variant = 'primary',
			size = 'medium',
			colorScheme = 'primary',
			isLoading = false,
			isFullWidth = false,
			disabled = false,
			...rest
		},
		ref
	) => {
		return (
			<StyledButton
				ref={ref}
				variant={variant}
				size={size}
				colorScheme={colorScheme}
				isFullWidth={isFullWidth}
				disabled={disabled || isLoading}
				aria-busy={isLoading}
				{...rest}
			>
				{isLoading && <LoadingSpinner aria-hidden='true' />}
				{children}
			</StyledButton>
		);
	}
);

Button.displayName = 'Button';
```

## Conclusion

Following these component API standards will ensure consistency across the PairFlix component library. These standards promote:

1. Developer experience through predictable APIs
2. Accessibility compliance
3. Type safety with TypeScript
4. Visual consistency with proper theme integration
5. Flexibility through composition patterns

All new components and component migrations should adhere to these standards to create a cohesive, maintainable component library.
