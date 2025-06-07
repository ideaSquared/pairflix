# @pairflix/components

A comprehensive React component library built with TypeScript and styled-components for the PairFlix application ecosystem.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Component Categories](#component-categories)
- [Building New Components](#building-new-components)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Theming](#theming)
- [Accessibility](#accessibility)
- [Contributing](#contributing)

## Overview

This component library provides reusable, accessible, and themeable React components for the PairFlix platform. All components are built with:

- **TypeScript** for type safety and developer experience
- **styled-components** for styling and theming
- **React forwardRef** for proper ref handling
- **WCAG 2.1 AA** accessibility compliance
- **Comprehensive testing** with Jest and React Testing Library

### Design Principles

1. **Consistency** - Unified design language across all applications
2. **Accessibility** - WCAG 2.1 AA compliance by default
3. **Performance** - Optimized for production with tree-shaking support
4. **Developer Experience** - TypeScript support with comprehensive documentation
5. **Customization** - Flexible theming and variant system

## Installation

```bash
# Install the component library
npm install @pairflix/components

# Peer dependencies (if not already installed)
npm install react react-dom styled-components
```

## Quick Start

### Basic Usage

```tsx
import { Button, Card, Badge, DataTable } from '@pairflix/components';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@pairflix/components/theme';

function App() {
	return (
		<ThemeProvider theme={lightTheme}>
			<Card>
				<Card.Header>
					<h2>Welcome to PairFlix</h2>
					<Badge variant='success'>New</Badge>
				</Card.Header>
				<Card.Content>
					<p>Start building with our component library!</p>
					<Button variant='primary' size='large'>
						Get Started
					</Button>
				</Card.Content>
			</Card>
		</ThemeProvider>
	);
}
```

### Theme Setup

```tsx
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '@pairflix/components/theme';

// Basic theme setup
<ThemeProvider theme={lightTheme}>
	<App />
</ThemeProvider>;

// Dynamic theme switching
const [isDark, setIsDark] = useState(false);
<ThemeProvider theme={isDark ? darkTheme : lightTheme}>
	<App />
</ThemeProvider>;
```

## Component Categories

### Data Display

Components for presenting information and data.

- **Badge** - Status indicators, counts, and labels
- **Card** - Content containers with headers, content, and actions
- **DataTable** - Advanced tables with sorting, selection, and pagination
- **Typography** - Text components (H1-H6, paragraphs, etc.)

```tsx
// Badge examples
<Badge variant="success">Active</Badge>
<Badge count={42} maxCount={99} />
<Badge dot variant="error" />

// Card examples
<Card variant="outlined" elevation="medium">
  <Card.Header withDivider>Header</Card.Header>
  <Card.Content>Content here</Card.Content>
  <Card.Footer>Footer actions</Card.Footer>
</Card>

// DataTable example
<DataTable
  columns={columns}
  data={users}
  sortable
  selectable
  onRowClick={handleRowClick}
  rowActions={(row) => <Button>Edit</Button>}
/>
```

### Form Controls

Interactive components for user input.

- **Button** - Primary, secondary, and specialized action buttons
- **Input** - Text inputs with validation and accessibility
- **Select** - Dropdown selections with search and multi-select
- **Textarea** - Multiline text input with auto-resize

```tsx
// Button examples
<Button variant="primary" size="large" isLoading>
  Save Changes
</Button>

// Input examples
<Input
  label="Email Address"
  type="email"
  required
  error="Please enter a valid email"
  helpText="We'll never share your email"
/>

// Select example
<Select
  label="Country"
  options={countries}
  searchable
  placeholder="Select a country..."
/>
```

### Layout

Components for structuring and organizing content.

- **Grid** - CSS Grid-based layout system
- **Flex** - Flexbox containers with responsive props
- **Container** - Max-width containers with breakpoint support
- **Spacer** - Consistent spacing utility component

```tsx
// Grid layout
<Grid columns={3} gap="lg" responsive>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// Flex layout
<Flex direction="column" align="center" gap="md">
  <H1>Title</H1>
  <Button>Action</Button>
</Flex>
```

## Building New Components

### Component Structure

Each component follows a consistent file structure:

```
components/
└── category/
    └── ComponentName/
        ├── ComponentName.tsx      # Main component implementation
        ├── ComponentName.test.tsx # Unit tests
        ├── ComponentName.stories.tsx # Storybook stories (optional)
        └── index.ts              # Barrel exports
```

### Step 1: Create Component Directory

```bash
# Create the component directory structure
mkdir -p src/components/[category]/[ComponentName]
cd src/components/[category]/[ComponentName]
```

### Step 2: Define Types and Interfaces

```tsx
// ComponentName.tsx
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { BaseComponentProps } from '../../../types';

export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'error';
export type ComponentSize = 'small' | 'medium' | 'large';

export interface ComponentNameProps
	extends BaseComponentProps,
		Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * The variant of the component
	 * @default 'primary'
	 */
	variant?: ComponentVariant;

	/**
	 * The size of the component
	 * @default 'medium'
	 */
	size?: ComponentSize;

	/**
	 * Whether the component is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Content of the component
	 */
	children?: React.ReactNode;

	/**
	 * Click handler
	 */
	onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}
```

### Step 3: Implement Styled Components

```tsx
// Helper functions for variants and sizes
const getVariantStyles = (variant: ComponentVariant = 'primary') => {
	const variants = {
		primary: css`
			background: ${({ theme }) => theme.colors.primary};
			color: ${({ theme }) => theme.colors.text.onPrimary};
		`,
		secondary: css`
			background: ${({ theme }) => theme.colors.secondary};
			color: ${({ theme }) => theme.colors.text.onSecondary};
		`,
		success: css`
			background: ${({ theme }) => theme.colors.text.success};
			color: ${({ theme }) => theme.colors.text.onPrimary};
		`,
		error: css`
			background: ${({ theme }) => theme.colors.text.error};
			color: ${({ theme }) => theme.colors.text.onPrimary};
		`,
	};
	return variants[variant];
};

const getSizeStyles = (size: ComponentSize = 'medium') => {
	const sizes = {
		small: css`
			padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) =>
					theme.spacing.sm};
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
		`,
		medium: css`
			padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) =>
					theme.spacing.md};
			font-size: ${({ theme }) => theme.typography.fontSize.base};
		`,
		large: css`
			padding: ${({ theme }) => theme.spacing.md} ${({ theme }) =>
					theme.spacing.lg};
			font-size: ${({ theme }) => theme.typography.fontSize.lg};
		`,
	};
	return sizes[size];
};

// Styled component
interface StyledComponentProps {
	$variant: ComponentVariant;
	$size: ComponentSize;
	$disabled: boolean;
}

const StyledComponent = styled.div<StyledComponentProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: ${({ theme }) => theme.borderRadius.md};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	transition: all 0.2s ease;
	cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
	opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

	${({ $variant }) => getVariantStyles($variant)}
	${({ $size }) => getSizeStyles($size)}
  
  /* Hover and focus states */
  &:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: ${({ theme }) => theme.shadows.sm};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.primary};
		outline-offset: 2px;
	}

	&:active:not(:disabled) {
		transform: translateY(0);
	}

	/* Responsive adjustments */
	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		${({ $size }) => $size === 'large' && getSizeStyles('medium')}
	}
`;
```

### Step 4: Implement Main Component

````tsx
/**
 * ComponentName description
 *
 * @example
 * ```tsx
 * <ComponentName variant="primary" size="large">
 *   Click me
 * </ComponentName>
 * ```
 */
export const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
	(
		{
			variant = 'primary',
			size = 'medium',
			disabled = false,
			children,
			className,
			onClick,
			...rest
		},
		ref
	) => {
		const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
			if (disabled) return;
			onClick?.(event);
		};

		return (
			<StyledComponent
				ref={ref}
				$variant={variant}
				$size={size}
				$disabled={disabled}
				className={className}
				onClick={handleClick}
				role='button'
				tabIndex={disabled ? -1 : 0}
				aria-disabled={disabled}
				{...rest}
			>
				{children}
			</StyledComponent>
		);
	}
);

ComponentName.displayName = 'ComponentName';

export default ComponentName;
````

### Step 5: Create Tests

```tsx
// ComponentName.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import ComponentName from './ComponentName';

const renderWithTheme = (component: React.ReactElement) => {
	return render(<ThemeProvider theme={lightTheme}>{component}</ThemeProvider>);
};

describe('ComponentName', () => {
	it('renders children correctly', () => {
		renderWithTheme(<ComponentName>Test Content</ComponentName>);
		expect(screen.getByText('Test Content')).toBeInTheDocument();
	});

	it('applies variant styles', () => {
		renderWithTheme(<ComponentName variant='success'>Test</ComponentName>);
		const component = screen.getByText('Test');
		expect(component).toHaveStyleRule(
			'background',
			lightTheme.colors.text.success
		);
	});

	it('handles click events when not disabled', () => {
		const onClickMock = jest.fn();
		renderWithTheme(
			<ComponentName onClick={onClickMock}>Click me</ComponentName>
		);

		fireEvent.click(screen.getByText('Click me'));
		expect(onClickMock).toHaveBeenCalledTimes(1);
	});

	it('does not handle click events when disabled', () => {
		const onClickMock = jest.fn();
		renderWithTheme(
			<ComponentName disabled onClick={onClickMock}>
				Click me
			</ComponentName>
		);

		fireEvent.click(screen.getByText('Click me'));
		expect(onClickMock).not.toHaveBeenCalled();
	});

	it('has proper accessibility attributes', () => {
		renderWithTheme(<ComponentName>Accessible</ComponentName>);
		const component = screen.getByText('Accessible');

		expect(component).toHaveAttribute('role', 'button');
		expect(component).toHaveAttribute('tabIndex', '0');
	});

	it('is disabled accessibly', () => {
		renderWithTheme(<ComponentName disabled>Disabled</ComponentName>);
		const component = screen.getByText('Disabled');

		expect(component).toHaveAttribute('aria-disabled', 'true');
		expect(component).toHaveAttribute('tabIndex', '-1');
	});
});
```

### Step 6: Create Barrel Exports

```tsx
// index.ts
export { ComponentName, default } from './ComponentName';
export type {
	ComponentNameProps,
	ComponentVariant,
	ComponentSize,
} from './ComponentName';
```

### Step 7: Update Category Index

```tsx
// components/category/index.ts
export * from './ComponentName';
export * from './ExistingComponent';
// ... other exports
```

### Step 8: Update Main Index

```tsx
// components/index.ts or src/index.ts
export * from './category';
// ... other category exports
```

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Build the library
npm run build
```

### Component Development Process

1. **Plan the Component**

   - Define the component's purpose and API
   - Review existing similar components
   - Document decision in the decision log

2. **Create the Structure**

   - Follow the established directory structure
   - Define TypeScript interfaces first
   - Plan the variant and size system

3. **Implement Styles**

   - Use styled-components with theme integration
   - Include responsive behavior
   - Add hover, focus, and active states

4. **Add Accessibility**

   - Include proper ARIA attributes
   - Ensure keyboard navigation
   - Test with screen readers

5. **Write Tests**

   - Unit tests for all props and variants
   - Accessibility testing
   - Event handling tests

6. **Document**
   - JSDoc comments for all props
   - Usage examples in comments
   - Update this README if needed

## Testing

### Testing Strategy

- **Unit Tests**: All components have comprehensive unit tests
- **Accessibility Tests**: Screen reader and keyboard navigation testing
- **Visual Tests**: Storybook for visual regression testing
- **Integration Tests**: Testing component interactions

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run accessibility tests
npm run test:a11y
```

### Writing Tests

Follow the established patterns shown in the Step 5 example above:

- Use `renderWithTheme` helper for consistent theme context
- Test all prop variants and combinations
- Include accessibility attribute testing
- Test event handling and edge cases

## Theming

### Theme Structure

The component library uses a comprehensive theme system:

```tsx
interface Theme {
	colors: {
		primary: string;
		secondary: string;
		background: {
			primary: string;
			secondary: string;
			paper: string;
			hover: string;
		};
		text: {
			primary: string;
			secondary: string;
			success: string;
			error: string;
			warning: string;
		};
		border: {
			default: string;
			light: string;
		};
	};
	spacing: {
		xs: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
	};
	typography: {
		fontSize: {
			xs: string;
			sm: string;
			base: string;
			lg: string;
			xl: string;
		};
		fontWeight: {
			normal: string;
			medium: string;
			bold: string;
		};
	};
	borderRadius: {
		sm: string;
		md: string;
		lg: string;
	};
	shadows: {
		sm: string;
		md: string;
		lg: string;
	};
	breakpoints: {
		sm: string;
		md: string;
		lg: string;
		xl: string;
	};
}
```

### Custom Themes

```tsx
import { createTheme } from '@pairflix/components/theme';

const customTheme = createTheme({
	colors: {
		primary: '#your-brand-color',
		// ... other overrides
	},
});

<ThemeProvider theme={customTheme}>
	<App />
</ThemeProvider>;
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

### Standards Implemented

- **Keyboard Navigation**: All interactive components are keyboard accessible
- **Screen Reader Support**: Proper ARIA attributes and semantic HTML
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: All text meets 4.5:1 contrast ratio minimum
- **Responsive Design**: Components work across all device sizes

### Testing Accessibility

```bash
# Run automated accessibility tests
npm run test:a11y

# Manual testing checklist
# 1. Navigate with keyboard only
# 2. Test with screen reader (NVDA, JAWS, VoiceOver)
# 3. Verify color contrast ratios
# 4. Test at 200% zoom level
```

## Contributing

### Before Contributing

1. Review existing components for patterns
2. Check the component inventory for duplicates
3. Document your decision in the decision log
4. Follow the established code standards

### Pull Request Process

1. Create a feature branch from `main`
2. Follow the component development process
3. Ensure all tests pass and coverage is maintained
4. Update documentation as needed
5. Request review from the component library team

### Code Standards

- **TypeScript**: Strict mode with comprehensive types
- **Styling**: styled-components with theme integration
- **Testing**: 80%+ test coverage with accessibility tests
- **Documentation**: JSDoc comments for all public APIs
- **Accessibility**: WCAG 2.1 AA compliance

## Support

For questions, issues, or contributions:

- **Documentation**: Check this README and component JSDoc comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Tag the component library team for reviews

---

**Happy building! 🚀**
