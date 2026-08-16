// Mock @pairflix/components for Jest tests
import * as React from 'react';

// Mock all the common components that might be used
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<'button'>
>((props, ref) => <button {...props} ref={ref} data-testid="mock-button" />);
Button.displayName = 'Button';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<'input'>
>((props, ref) => <input {...props} ref={ref} data-testid="mock-input" />);
Input.displayName = 'Input';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-card" />);
Card.displayName = 'Card';

export const Container = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-container" />);
Container.displayName = 'Container';

export const Text = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithRef<'span'>
>((props, ref) => <span {...props} ref={ref} data-testid="mock-text" />);
Text.displayName = 'Text';

export const Heading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithRef<'h1'>
>((props, ref) => (
  <h1 {...props} ref={ref} data-testid="mock-heading">
    {props.children}
  </h1>
));
Heading.displayName = 'Heading';

export const Form = React.forwardRef<
  HTMLFormElement,
  React.ComponentPropsWithRef<'form'>
>((props, ref) => <form {...props} ref={ref} data-testid="mock-form" />);
Form.displayName = 'Form';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithRef<'label'>
>(({ htmlFor, ...props }, ref) => (
  <label {...props} ref={ref} htmlFor={htmlFor} data-testid="mock-label" />
));
Label.displayName = 'Label';

export const Spinner = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => (
  <div {...props} ref={ref} data-testid="mock-spinner">
    Loading...
  </div>
));
Spinner.displayName = 'Spinner';

export const Modal = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-modal" />);
Modal.displayName = 'Modal';

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-alert" />);
Alert.displayName = 'Alert';

export const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithRef<'h2'>
>((props, ref) => (
  <h2 {...props} ref={ref} data-testid="mock-h2">
    {props.children}
  </h2>
));
H2.displayName = 'H2';

export const ErrorText = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithRef<'span'>
>((props, ref) => (
  <span
    {...props}
    ref={ref}
    data-testid="mock-error-text"
    style={{ color: 'red' }}
  />
));
ErrorText.displayName = 'ErrorText';

export const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-input-group" />);
InputGroup.displayName = 'InputGroup';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-card-content" />);
CardContent.displayName = 'CardContent';

// Mock any other exports that might be needed
export const theme = {
  colors: {
    primary: '#000',
    secondary: '#666',
    background: '#fff',
    text: '#000',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};

// Mock theme contract for the vanilla-extract cutover. Every admin `X.css.ts`
// file does `import { vars } from '@pairflix/components'`, which resolves to
// this mock under Jest (see moduleNameMapper in jest.config.ts) instead of
// the real package -- these plain strings just need to exist at the same
// nested shape as the real `vars` (packages/lib.components/src/styles/theme.css.ts)
// so `style()`/`recipe()` calls in those files don't blow up on `undefined`.
// jsdom doesn't resolve real CSS either way, so the values themselves are
// inert placeholders.
export const vars = {
  colors: {
    primary: 'mock-color-primary',
    primaryHover: 'mock-color-primary-hover',
    secondary: 'mock-color-secondary',
    background: {
      primary: 'mock-color-background-primary',
      secondary: 'mock-color-background-secondary',
      input: 'mock-color-background-input',
      card: 'mock-color-background-card',
      paper: 'mock-color-background-paper',
      hover: 'mock-color-background-hover',
      highlight: 'mock-color-background-highlight',
    },
    border: 'mock-color-border',
    overlay: 'mock-color-overlay',
    text: {
      primary: 'mock-color-text-primary',
      secondary: 'mock-color-text-secondary',
      error: 'mock-color-text-error',
      success: 'mock-color-text-success',
      warning: 'mock-color-text-warning',
    },
    status: {
      toWatch: 'mock-color-status-to-watch',
      watchTogetherFocused: 'mock-color-status-watch-together-focused',
      watchTogetherBackground: 'mock-color-status-watch-together-background',
      watching: 'mock-color-status-watching',
      finished: 'mock-color-status-finished',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  typography: {
    fontFamily: 'mock-font-family',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '700',
    },
  },
  shadows: {
    sm: 'mock-shadow-sm',
    md: 'mock-shadow-md',
    lg: 'mock-shadow-lg',
    xl: 'mock-shadow-xl',
  },
};

export const lightThemeClass = 'mock-light-theme';
export const darkThemeClass = 'mock-dark-theme';
export const themeRoot = 'mock-theme-root';

// Default export for the entire module
const components = {
  Button,
  Input,
  Card,
  Container,
  Text,
  Heading,
  H2,
  ErrorText,
  InputGroup,
  CardContent,
  Form,
  Label,
  Spinner,
  Modal,
  Alert,
  theme,
};

export default components;
