// Mock @pairflix/components for Jest tests
import * as React from 'react';

// Mock all the common components that might be used
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<'button'>
>((props, ref) => <button {...props} ref={ref} data-testid="mock-button" />);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithRef<'input'>
>((props, ref) => <input {...props} ref={ref} data-testid="mock-input" />);

export const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-card" />);

export const Container = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-container" />);

export const Text = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithRef<'span'>
>((props, ref) => <span {...props} ref={ref} data-testid="mock-text" />);

export const Heading = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithRef<'h1'>
>((props, ref) => <h1 {...props} ref={ref} data-testid="mock-heading" />);

export const Form = React.forwardRef<
  HTMLFormElement,
  React.ComponentPropsWithRef<'form'>
>((props, ref) => <form {...props} ref={ref} data-testid="mock-form" />);

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithRef<'label'>
>((props, ref) => <label {...props} ref={ref} data-testid="mock-label" />);

export const Spinner = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => (
  <div {...props} ref={ref} data-testid="mock-spinner">
    Loading...
  </div>
));

export const Modal = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-modal" />);

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-alert" />);

export const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithRef<'h2'>
>((props, ref) => <h2 {...props} ref={ref} data-testid="mock-h2" />);

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

export const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-input-group" />);

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithRef<'div'>
>((props, ref) => <div {...props} ref={ref} data-testid="mock-card-content" />);

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
