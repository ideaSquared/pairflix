import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { BaseComponentProps, Size } from '../../../types';

/**
 * Base props for all input components
 */
export interface InputBaseProps extends BaseComponentProps {
	/**
	 * Whether the input takes up the full width of its container
	 * @default false
	 */
	isFullWidth?: boolean;

	/**
	 * Whether the input is in an error state
	 * @default false
	 */
	isInvalid?: boolean;

	/**
	 * The size of the input
	 * @default 'medium'
	 */
	size?: Size;

	/**
	 * Content to display at the start of the input
	 */
	startAdornment?: React.ReactNode;

	/**
	 * Content to display at the end of the input
	 */
	endAdornment?: React.ReactNode;
}

/**
 * Props for the Input component
 */
export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
		InputBaseProps {
	/**
	 * Label text for the input
	 */
	label?: string;

	/**
	 * Helper text displayed below the input
	 */
	helperText?: string;

	/**
	 * Optional ID for the input element (generated from label if not provided)
	 */
	id?: string;
}

/**
 * Props for styled input element
 * @private Internal use only
 */
interface StyledInputProps {
	$isFullWidth?: boolean;
	$isInvalid?: boolean;
	$size?: Size;
	$hasStartAdornment?: boolean;
	$hasEndAdornment?: boolean;
}

const getInputPadding = (size: Size = 'medium') => {
	switch (size) {
		case 'small':
			return css`
				padding: ${({ theme }) => theme.spacing.xs || '4px'}
					${({ theme }) => theme.spacing.sm || '8px'};
			`;
		case 'large':
			return css`
				padding: ${({ theme }) => theme.spacing.md || '12px'}
					${({ theme }) => theme.spacing.lg || '16px'};
			`;
		default:
			return css`
				padding: ${({ theme }) => theme.spacing.sm || '8px'}
					${({ theme }) => theme.spacing.md || '12px'};
			`;
	}
};

const getInputHeight = (size: Size = 'medium') => {
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
		${({ $isInvalid, theme }) =>
			$isInvalid
				? theme.colors.error || theme.colors.text.error || '#f44336'
				: theme.colors.border?.default || '#e0e0e0'};
	border-radius: ${({ theme }) => theme.borderRadius.sm || '4px'};
	${({ $size }) => getInputPadding($size)};
	width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
	height: ${({ $size }) => getInputHeight($size)};
	font-size: ${({ theme, $size }) =>
		$size === 'small'
			? theme.typography.fontSize.sm || '14px'
			: $size === 'large'
			? theme.typography.fontSize.lg || '18px'
			: theme.typography.fontSize.md || '16px'};
	transition: all 0.2s ease-in-out;
	padding-left: ${({ $hasStartAdornment }) =>
		$hasStartAdornment ? '36px' : undefined};
	padding-right: ${({ $hasEndAdornment }) =>
		$hasEndAdornment ? '36px' : undefined};

	&::placeholder {
		color: ${({ theme }) => theme.colors.text.secondary || '#666666'};
		opacity: 0.8;
	}

	&:hover:not(:disabled) {
		border-color: ${({ $isInvalid, theme }) =>
			$isInvalid
				? theme.colors.error || theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
	}

	&:focus {
		outline: none;
		border-color: ${({ $isInvalid, theme }) =>
			$isInvalid
				? theme.colors.error || theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
		box-shadow: 0 0 0 2px
			${({ $isInvalid, theme }) =>
				$isInvalid
					? `${theme.colors.error || theme.colors.text.error || '#f44336'}40`
					: `${theme.colors.primary || '#0077cc'}40`};
	}

	&:focus-visible {
		outline: 2px solid
			${({ $isInvalid, theme }) =>
				$isInvalid
					? theme.colors.error || theme.colors.text.error || '#f44336'
					: theme.colors.primary || '#0077cc'};
		outline-offset: 2px;
	}

	&:disabled {
		background: ${({ theme }) =>
			theme.colors.background.secondary || '#f5f5f5'};
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints?.sm || '576px'}) {
		width: 100%;
		min-height: 44px;
		font-size: ${({ theme }) => theme.typography.fontSize.md || '16px'};
	}
`;

export const InputLabel = styled.label<{
	$isInvalid?: boolean;
	$isRequired?: boolean;
}>`
	display: block;
	margin-bottom: ${({ theme }) => theme.spacing.xs || '4px'};
	color: ${({ theme, $isInvalid }) =>
		$isInvalid
			? theme.colors.error || theme.colors.text.error || '#f44336'
			: theme.colors.text.primary || '#000000'};
	font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium || '500'};

	${({ $isRequired, theme }) =>
		$isRequired
			? `
    &::after {
      content: " *";
      color: ${theme.colors.error || theme.colors.text.error || '#f44336'};
    }
  `
			: ''}

	@media (max-width: ${({ theme }) => theme.breakpoints?.sm || '576px'}) {
		margin-bottom: calc(${({ theme }) => theme.spacing.xs || '4px'} * 0.8);
	}
`;

export const InputError = styled.div`
	display: block;
	color: ${({ theme }) =>
		theme.colors.error || theme.colors.text.error || '#f44336'};
	font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
	margin-top: ${({ theme }) => theme.spacing.xs || '4px'};
`;

export const InputGroup = styled.div<{ $isFullWidth?: boolean }>`
	display: flex;
	flex-direction: column;
	width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
	margin-bottom: ${({ theme }) => theme.spacing.md || '12px'};
	position: relative;

	@media (max-width: ${({ theme }) => theme.breakpoints?.sm || '576px'}) {
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

	/* Enable pointer events for interactive elements */
	button,
	a,
	[role='button'] {
		pointer-events: auto;
	}
`;

/**
 * Input component for text entry with optional label and error message
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			isInvalid,
			helperText,
			required,
			isFullWidth = false,
			startAdornment,
			endAdornment,
			id,
			size = 'medium',
			className,
			...props
		},
		ref
	) => {
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

		return (
			<InputGroup $isFullWidth={isFullWidth} className={className}>
				{label && (
					<InputLabel
						htmlFor={inputId}
						$isInvalid={isInvalid}
						$isRequired={required}
					>
						{label}
					</InputLabel>
				)}
				<div style={{ position: 'relative' }}>
					{startAdornment && (
						<AdornmentWrapper position='start'>
							{startAdornment}
						</AdornmentWrapper>
					)}
					<StyledInput
						ref={ref}
						id={inputId}
						$isInvalid={isInvalid}
						$isFullWidth={isFullWidth}
						$size={size}
						$hasStartAdornment={!!startAdornment}
						$hasEndAdornment={!!endAdornment}
						aria-invalid={isInvalid || undefined}
						aria-required={required || undefined}
						required={required}
						{...props}
					/>
					{endAdornment && (
						<AdornmentWrapper position='end'>{endAdornment}</AdornmentWrapper>
					)}
				</div>
				{helperText && <InputError>{helperText}</InputError>}
			</InputGroup>
		);
	}
);

Input.displayName = 'Input';

export default Input;
