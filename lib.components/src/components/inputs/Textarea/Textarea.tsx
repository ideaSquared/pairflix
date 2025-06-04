import React, {
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import styled from 'styled-components';
import { InputError, InputGroup, InputLabel } from '../Input';

// Base props without HTML textarea props
interface BaseTextareaProps {
	fullWidth?: boolean;
	error?: boolean;
	size?: 'small' | 'medium' | 'large';
	maxLength?: number;
	showCharacterCount?: boolean;
	autoGrow?: boolean;
}

// Main props including HTML textarea props
export interface TextareaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
		BaseTextareaProps {}

// Use transient props for styled components (prefixed with $)
interface StyledTextareaProps {
	$fullWidth?: boolean;
	$error?: boolean;
	$size?: 'small' | 'medium' | 'large';
	$autoGrow?: boolean;
}

// Props for the main Textarea component interface
interface TextareaFieldProps extends TextareaProps {
	label?: string;
	error?: boolean;
	helperText?: string;
	required?: boolean;
}

const CharacterCount = styled.div<{ $error?: boolean }>`
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	color: ${({ theme, $error }) =>
		$error ? theme.colors.text.error : theme.colors.text.secondary};
	text-align: right;
	margin-top: 4px;
`;

const StyledTextarea = styled.textarea<StyledTextareaProps>`
	width: 100%;
	padding: ${({ theme }) => theme.spacing.sm};
	border: 1px solid ${({ theme }) => theme.colors.border.default};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	font-family: inherit;
	font-size: ${({ theme }) => theme.typography.fontSize.md};
	line-height: 1.5;
	transition: border-color 0.2s;

	&:focus {
		border-color: ${({ theme }) => theme.colors.primary.main};
		outline: none;
	}

	${({ $size, theme }) =>
		$size === 'small' &&
		`
        padding: ${theme.spacing.xs} ${theme.spacing.sm};
        font-size: ${theme.typography.fontSize.sm};
        min-height: 60px;
    `}

	${({ $size, theme }) =>
		$size === 'large' &&
		`
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        font-size: ${theme.typography.fontSize.lg};
        min-height: 120px;
    `}

    ${({ $autoGrow }) =>
		$autoGrow &&
		`
        overflow: hidden;
        resize: none;
    `}

    &[aria-invalid="true"] {
		border-color: ${({ theme }) => theme.colors.text.error};
	}
`;

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
			fullWidth = false,
			id,
			size = 'medium',
			maxLength,
			showCharacterCount,
			autoGrow,
			value = '',
			onChange,
			...props
		},
		ref
	) => {
		const textareaId =
			id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
		const [characterCount, setCharacterCount] = useState(String(value).length);
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
			setCharacterCount(e.target.value.length);
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

		const isOverLimit = maxLength ? characterCount > maxLength : false;

		return (
			<InputGroup $isFullWidth={fullWidth}>
				{label && (
					<InputLabel
						htmlFor={textareaId}
						$isInvalid={error ?? isOverLimit}
						$isRequired={required ?? false}
					>
						{label}
					</InputLabel>
				)}
				<StyledTextarea
					ref={handleRef}
					id={textareaId}
					$error={error ?? isOverLimit}
					$fullWidth={fullWidth}
					$size={size}
					$autoGrow={autoGrow}
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
							<CharacterCount $error={isOverLimit}>
								{characterCount}
								{maxLength && ` / ${maxLength}`}
							</CharacterCount>
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
	({ fullWidth = false, error, ...props }, ref) => (
		<StyledTextarea
			ref={ref}
			$fullWidth={fullWidth}
			$error={error}
			{...props}
		/>
	)
);

SimpleTextarea.displayName = 'SimpleTextarea';
