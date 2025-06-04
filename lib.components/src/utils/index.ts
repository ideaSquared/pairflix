// Utils barrel file
// This will export utility functions for components

// Function to merge classNames with potential undefined values
export const cx = (...classNames: (string | undefined | false | null)[]) => {
	return classNames.filter(Boolean).join(' ');
};

// Function to create a testId with consistent format
export const createTestId = (component: string, variant?: string) => {
	return variant ? `${component}-${variant}` : component;
};

// Types of keyboard events
export enum KeyboardKeys {
	ENTER = 'Enter',
	SPACE = ' ',
	ESCAPE = 'Escape',
	TAB = 'Tab',
	ARROW_UP = 'ArrowUp',
	ARROW_DOWN = 'ArrowDown',
	ARROW_LEFT = 'ArrowLeft',
	ARROW_RIGHT = 'ArrowRight',
}

// Helper to check if element is a specific HTML element
export const isHTMLElement = (element: any, tagName: string): boolean => {
	return element?.tagName?.toLowerCase() === tagName.toLowerCase();
};
