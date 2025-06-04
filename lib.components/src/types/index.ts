// Types barrel file
// This will export shared TypeScript types

import { ElementType, ReactNode } from 'react';

// Base component props that all components can extend
export interface BaseComponentProps {
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

	// Children
	children?: ReactNode;
}

// Standard sizes that can be used across components
export type Size = 'small' | 'medium' | 'large';

// Standard color schemes for components
export type ColorScheme =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'error'
	| 'info';

// Polymorphic component types (for as prop)
export type AsProps<E extends ElementType = ElementType> = {
	as?: E;
};

export type PolymorphicComponentProps<E extends ElementType, P> = AsProps<E> &
	Omit<React.ComponentProps<E>, keyof (AsProps<E> & P)> &
	P;
