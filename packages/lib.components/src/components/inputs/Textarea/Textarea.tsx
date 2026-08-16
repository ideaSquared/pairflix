import clsx from 'clsx';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { InputError, InputGroup, InputLabel } from '../Input';
import { characterCount, textarea } from './Textarea.css';

// Base props without HTML textarea props
interface BaseTextareaProps {
  isFullWidth?: boolean;
  error?: boolean;
  size?: 'small' | 'medium' | 'large';
  maxLength?: number;
  showCharacterCount?: boolean;
  autoGrow?: boolean;
}

// Main props including HTML textarea props
export interface TextareaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    BaseTextareaProps {}

// Props for the main Textarea component interface
interface TextareaFieldProps extends TextareaProps {
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

/**
 * Enhanced Textarea component with support for character count, auto-growing, and different sizes
 * @component
 * @example
 * ```tsx
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description"
 *   maxLength={500}
 *   showCharacterCount
 *   autoGrow
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      isFullWidth = false,
      id,
      size = 'medium',
      maxLength,
      showCharacterCount,
      autoGrow,
      value = '',
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [characterCountValue, setCharacterCountValue] = useState(
      String(value).length
    );
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const handleRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
      setCharacterCountValue(e.target.value.length);
      if (autoGrow && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    useEffect(() => {
      if (autoGrow && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [value, autoGrow]);

    const isOverLimit = maxLength ? characterCountValue > maxLength : false;

    return (
      <InputGroup isFullWidth={isFullWidth}>
        {label && (
          <InputLabel
            htmlFor={textareaId}
            $isInvalid={error ?? isOverLimit}
            $isRequired={required ?? false}
          >
            {label}
          </InputLabel>
        )}
        <textarea
          ref={handleRef}
          id={textareaId}
          className={clsx(textarea({ size, autoGrow }), className)}
          aria-invalid={error ?? isOverLimit}
          aria-required={required}
          aria-describedby={helperText ? `${textareaId}-helper` : undefined}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {(helperText || showCharacterCount) && (
          <>
            {helperText && (
              <InputError id={`${textareaId}-helper`}>{helperText}</InputError>
            )}
            {showCharacterCount && (
              <div className={characterCount({ error: isOverLimit })}>
                {characterCountValue}
                {maxLength && ` / ${maxLength}`}
              </div>
            )}
          </>
        )}
      </InputGroup>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * SimpleTextarea component without label or error handling
 */
export const SimpleTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      isFullWidth: _isFullWidth,
      error,
      size = 'medium',
      autoGrow,
      className,
      ...props
    },
    ref
  ) => (
    <textarea
      ref={ref}
      className={clsx(textarea({ size, autoGrow }), className)}
      aria-invalid={error}
      {...props}
    />
  )
);

SimpleTextarea.displayName = 'SimpleTextarea';
