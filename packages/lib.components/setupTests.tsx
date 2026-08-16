// Polyfill for TextEncoder and TextDecoder (needed for modern browser APIs)
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import 'jest-axe/extend-expect';
import React from 'react';

// Mock ResizeObserver for Radix UI components
(global as any).ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Extend global types for TypeScript - must be before using globals
declare global {
  // Use interfaces to avoid circular references
  interface Window {
    React: any; // Using any to avoid circular references
    render: any; // Using any to avoid circular references
  }
}

// Assign to globals (now properly typed)
(global as any).React = React;
(global as any).render = render;

// Configure jest-axe for accessibility testing
import { configureAxe } from 'jest-axe';

const axe = configureAxe({
  rules: {
    // Configure specific rules for component library
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
  },
});

(global as any).axe = axe;
