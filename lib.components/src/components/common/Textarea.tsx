import React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';
import { InputError, InputGroup, InputLabel } from './Input';

// Base props without HTML textarea props
interface BaseTextareaProps {
	fullWidth?: boolean;
	error?: boolean;
}

// Main props including HTML textarea props
export interface TextareaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
		BaseTextareaProps {}

interface TextareaGroupProps {
	fullWidth?: boolean;
}

// Use transient props for styled components (prefixed with $)
interface StyledTextareaProps {
	$fullWidth?: boolean;
	$error?: boolean;
}

// Props for the main Textarea component interface
interface TextareaFieldProps extends TextareaProps {
	label?: string;
	error?: boolean;
	helperText?: string;
	required?: boolean;
}

const StyledTextarea = styled.textarea<StyledTextareaProps>`
	background: ${({ theme }: { theme: Theme }) =>
		theme.colors.background.input || '#ffffff'};
	color: ${({ theme }: { theme: Theme }) =>
		theme.colors.text.primary || '#000000'};
	border: 1px solid
		${({ $error, theme }: { $error?: boolean; theme: Theme }) =>
			$error ?? false
				? theme.colors.text.error || '#f44336'
				: theme.colors.border || '#e0e0e0'};
	border-radius: ${({ theme }: { theme: Theme }) =>
		theme.borderRadius.sm || '4px'};
	padding: ${({ theme }: { theme: Theme }) => theme.spacing.sm || '8px'}
		${({ theme }: { theme: Theme }) => theme.spacing.md || '12px'};
	width: ${({ $fullWidth }: { $fullWidth?: boolean }) =>
		$fullWidth ?? false ? '100%' : 'auto'};
	min-height: 80px;
	font-family: inherit;
	font-size: ${({ theme }: { theme: Theme }) =>
		theme.typography.fontSize.md || '16px'};
	line-height: 1.5;
	transition: all 0.2s ease-in-out;
	resize: vertical;

	&::placeholder {
		color: ${({ theme }: { theme: Theme }) =>
			theme.colors.text.secondary || '#666666'};
		opacity: 0.8;
	}

	&:hover:not(:disabled) {
		border-color: ${({ $error, theme }: { $error?: boolean; theme: Theme }) =>
			$error ?? false
				? theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
	}
	&:focus {
		outline: none;
		border-color: ${({ $error, theme }: { $error?: boolean; theme: Theme }) =>
			$error ?? false
				? theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
		box-shadow: 0 0 0 2px
			${({ $error, theme }: { $error?: boolean; theme: Theme }) =>
				$error ?? false
					? `${theme.colors.text.error || '#f44336'}40`
					: `${theme.colors.primary || '#0077cc'}40`};
	}
	&:focus-visible {
		outline: 2px solid
			${({ $error, theme }: { $error?: boolean; theme: Theme }) =>
				$error ?? false
					? theme.colors.text.error || '#f44336'
					: theme.colors.primary || '#0077cc'};
		outline-offset: 2px;
	}

	&:disabled {
		background: ${({ theme }: { theme: Theme }) =>
			theme.colors.background.secondary || '#f5f5f5'};
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (max-width: ${({ theme }: { theme: Theme }) =>
			theme.breakpoints.sm || '576px'}) {
		width: 100%;
		min-height: 100px;
	}
`;

/**
 * Textarea component that combines a textarea field with label and error message
 */
export const Textarea: React.FC<TextareaFieldProps> = ({
	label,
	error,
	helperText,
	required,
	fullWidth = false,
	id,
	...props
}) => {
	const textareaId =
		id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

	return (
		<InputGroup fullWidth={fullWidth}>
			{label && (
				<InputLabel
					htmlFor={textareaId}
					$error={error ?? false}
					$required={required ?? false}
				>
					{label}
				</InputLabel>
			)}
			<StyledTextarea
				id={textareaId}
				$error={error ?? false}
				$fullWidth={fullWidth ?? false}
				aria-invalid={error ?? false}
				aria-required={required ?? false}
				required={required}
				{...props}
			/>
			{helperText && <InputError>{helperText}</InputError>}
		</InputGroup>
	);
};
