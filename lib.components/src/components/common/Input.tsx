import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../styles/theme';

export type InputSize = 'small' | 'medium' | 'large';

// Base props without HTML input props
interface BaseInputProps {
	fullWidth?: boolean;
	error?: boolean;
	size?: InputSize;
	startAdornment?: React.ReactNode;
	endAdornment?: React.ReactNode;
}

// Main props including HTML input props, but omitting conflicting ones
export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
		BaseInputProps {}

interface InputGroupProps {
	fullWidth?: boolean;
	hasAdornment?: boolean;
}

// Use transient props for styled components (prefixed with $)
interface StyledInputProps {
	$fullWidth?: boolean;
	$error?: boolean;
	$size?: InputSize;
	$startAdornment?: React.ReactNode;
	$endAdornment?: React.ReactNode;
}

const getInputPadding = (size: InputSize = 'medium') => {
	switch (size) {
		case 'small':
			return css<{ theme: Theme }>`
				padding: ${({ theme }) => theme.spacing.xs || '4px'}
					${({ theme }) => theme.spacing.sm || '8px'};
			`;
		case 'large':
			return css<{ theme: Theme }>`
				padding: ${({ theme }) => theme.spacing.md || '12px'}
					${({ theme }) => theme.spacing.lg || '16px'};
			`;
		default:
			return css<{ theme: Theme }>`
				padding: ${({ theme }) => theme.spacing.sm || '8px'}
					${({ theme }) => theme.spacing.md || '12px'};
			`;
	}
};

const getInputHeight = (size: InputSize = 'medium') => {
	switch (size) {
		case 'small':
			return '32px';
		case 'large':
			return '48px';
		default:
			return '40px';
	}
};

const StyledInput = styled.input<StyledInputProps>`
	background: ${({ theme }) => theme.colors.background.input || '#ffffff'};
	color: ${({ theme }) => theme.colors.text.primary || '#000000'};
	border: 1px solid
		${({ $error, theme }) =>
			$error
				? theme.colors.text.error || '#f44336'
				: theme.colors.border || '#e0e0e0'};
	border-radius: ${({ theme }) => theme.borderRadius.sm || '4px'};
	${({ $size }) => getInputPadding($size)};
	width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
	height: ${({ $size }) => getInputHeight($size)};
	font-size: ${({ theme, $size }) =>
		$size === 'small'
			? theme.typography.fontSize.sm || '14px'
			: $size === 'large'
			? theme.typography.fontSize.lg || '18px'
			: theme.typography.fontSize.md || '16px'};
	transition: all 0.2s ease-in-out;
	padding-left: ${({ $startAdornment }) =>
		$startAdornment ? '36px' : undefined};
	padding-right: ${({ $endAdornment }) => ($endAdornment ? '36px' : undefined)};

	&::placeholder {
		color: ${({ theme }) => theme.colors.text.secondary || '#666666'};
		opacity: 0.8;
	}

	&:hover:not(:disabled) {
		border-color: ${({ $error, theme }) =>
			$error
				? theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
	}

	&:focus {
		outline: none;
		border-color: ${({ $error, theme }) =>
			$error
				? theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
		box-shadow: 0 0 0 2px
			${({ $error, theme }) =>
				$error
					? `${theme.colors.text.error || '#f44336'}40`
					: `${theme.colors.primary || '#0077cc'}40`};
	}

	&:focus-visible {
		outline: 2px solid
			${({ $error, theme }) =>
				$error
					? theme.colors.text.error || '#f44336'
					: theme.colors.primary || '#0077cc'};
		outline-offset: 2px;
	}

	&:disabled {
		background: ${({ theme }) =>
			theme.colors.background.secondary || '#f5f5f5'};
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		width: 100%;
		min-height: 44px;
		font-size: ${({ theme }) => theme.typography.fontSize.md || '16px'};
	}
`;

export const InputLabel = styled.label<{
	$error?: boolean;
	$required?: boolean;
}>`
	display: block;
	margin-bottom: ${({ theme }) => theme.spacing.xs || '4px'};
	color: ${({ theme, $error }) =>
		$error
			? theme.colors.text.error || '#f44336'
			: theme.colors.text.primary || '#000000'};
	font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium || '500'};

	${({ $required, theme }) =>
		$required &&
		`
		&:after {
			content: " *";
			color: ${theme.colors.text.error || '#f44336'};
		}
	`}

	@media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		margin-bottom: calc(${({ theme }) => theme.spacing.xs || '4px'} * 0.8);
	}
`;

export const InputError = styled.span`
	display: block;
	color: ${({ theme }) => theme.colors.text.error || '#f44336'};
	font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
	margin-top: ${({ theme }) => theme.spacing.xs || '4px'};
`;

export const InputGroup = styled.div<InputGroupProps>`
	display: flex;
	flex-direction: column;
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	margin-bottom: ${({ theme }) => theme.spacing.md || '12px'};
	position: relative;

	@media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		width: 100%;
		margin-bottom: ${({ theme }) => theme.spacing.sm || '8px'};
	}
`;

const AdornmentWrapper = styled.div<{ position: 'start' | 'end' }>`
	position: absolute;
	top: 50%;
	${({ position }) => (position === 'start' ? 'left: 12px;' : 'right: 12px;')}
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${({ theme }) => theme.colors.text.secondary || '#666666'};
	pointer-events: none;
`;

interface InputFieldProps extends InputProps {
	label?: string;
	error?: boolean;
	helperText?: string;
	required?: boolean;
}

/**
 * Input component that combines an input field with label and error message
 */
export const Input: React.FC<InputFieldProps> = ({
	label,
	error,
	helperText,
	required,
	fullWidth = false,
	startAdornment,
	endAdornment,
	id,
	size,
	...props
}) => {
	const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

	return (
		<InputGroup fullWidth={fullWidth}>
			{label && (
				<InputLabel htmlFor={inputId} $error={error} $required={required}>
					{label}
				</InputLabel>
			)}
			{startAdornment && (
				<AdornmentWrapper position='start'>{startAdornment}</AdornmentWrapper>
			)}
			<StyledInput
				id={inputId}
				$error={error}
				$fullWidth={fullWidth}
				$size={size}
				$startAdornment={startAdornment}
				$endAdornment={endAdornment}
				aria-invalid={error}
				aria-required={required}
				required={required}
				{...props}
			/>
			{endAdornment && (
				<AdornmentWrapper position='end'>{endAdornment}</AdornmentWrapper>
			)}
			{helperText && <InputError>{helperText}</InputError>}
		</InputGroup>
	);
};

/**
 * Password input field with optional show/hide functionality
 */
export const PasswordInput: React.FC<InputFieldProps> = (props) => {
	const [showPassword, setShowPassword] = React.useState(false);

	const togglePassword = () => setShowPassword(!showPassword);

	return (
		<Input
			type={showPassword ? 'text' : 'password'}
			endAdornment={
				<button
					type='button'
					onClick={togglePassword}
					style={{
						background: 'none',
						border: 'none',
						cursor: 'pointer',
						padding: '4px',
						color: 'inherit',
					}}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
				>
					{showPassword ? '👁️' : '👁️‍🗨️'}
				</button>
			}
			{...props}
		/>
	);
};
