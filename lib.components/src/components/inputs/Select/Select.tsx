import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { BaseComponentProps, Size } from '../../../types';

export interface SelectOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

export interface SelectBaseProps extends BaseComponentProps {
	/**
	 * Whether the select takes up the full width of its container
	 * @default false
	 */
	isFullWidth?: boolean;

	/**
	 * Whether the select is in an error state
	 * @default false
	 */
	isInvalid?: boolean;

	/**
	 * The size of the select
	 * @default 'medium'
	 */
	size?: Size;

	/**
	 * Array of options for the select
	 */
	options?: SelectOption[];

	/**
	 * Label text for the select
	 */
	label?: string;

	/**
	 * Helper text displayed below the select
	 */
	helperText?: string;

	/**
	 * Whether the select is required
	 * @default false
	 */
	required?: boolean;

	/**
	 * Custom placeholder text
	 */
	placeholder?: string;
}

export interface SelectProps
	extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
		SelectBaseProps {}

interface StyledSelectProps {
	$isFullWidth?: boolean;
	$isInvalid?: boolean;
	$size?: Size;
}

const getSelectPadding = (size: Size = 'medium') => {
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

const getSelectHeight = (size: Size = 'medium') => {
	switch (size) {
		case 'small':
			return '32px';
		case 'large':
			return '48px';
		default:
			return '40px';
	}
};

const StyledSelect = styled.select<StyledSelectProps>`
	appearance: none;
	background: ${({ theme }) => theme.colors.background.input || '#ffffff'};
	background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
	background-repeat: no-repeat;
	background-position: right 8px center;
	background-size: 16px;
	color: ${({ theme }) => theme.colors.text.primary || '#000000'};
	border: 1px solid
		${({ $isInvalid, theme }) =>
			$isInvalid
				? theme.colors.error || theme.colors.text.error || '#f44336'
				: theme.colors.border?.default || '#e0e0e0'};
	border-radius: ${({ theme }) => theme.borderRadius.sm || '4px'};
	${({ $size }) => getSelectPadding($size)};
	width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
	height: ${({ $size }) => getSelectHeight($size)};
	font-size: ${({ theme, $size }) =>
		$size === 'small'
			? theme.typography.fontSize.sm || '14px'
			: $size === 'large'
			? theme.typography.fontSize.lg || '18px'
			: theme.typography.fontSize.md || '16px'};
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	padding-right: ${({ theme }) =>
		theme.spacing.xl || '24px'}; // Space for arrow

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
		background-color: ${({ theme }) =>
			theme.colors.background.secondary || '#f5f5f5'};
		cursor: not-allowed;
		opacity: 0.6;
	}

	& option {
		background: ${({ theme }) => theme.colors.background.input || '#ffffff'};
		color: ${({ theme }) => theme.colors.text.primary || '#000000'};
		padding: ${({ theme }) => theme.spacing.sm || '8px'};

		&:disabled {
			color: ${({ theme }) => theme.colors.text.disabled || '#999999'};
		}
	}

	@media (max-width: ${({ theme }) => theme.breakpoints?.sm || '576px'}) {
		width: 100%;
		min-height: 44px;
		font-size: ${({ theme }) => theme.typography.fontSize.md || '16px'};
	}
`;

export const SelectLabel = styled.label<{
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

export const SelectError = styled.div`
	display: block;
	color: ${({ theme }) =>
		theme.colors.error || theme.colors.text.error || '#f44336'};
	font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
	margin-top: ${({ theme }) => theme.spacing.xs || '4px'};
`;

export const SelectGroup = styled.div<{ $isFullWidth?: boolean }>`
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

/**
 * Enhanced Select component with TypeScript support and accessibility features
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			label,
			isInvalid,
			helperText,
			required,
			isFullWidth = false,
			size = 'medium',
			options = [],
			className,
			placeholder,
			children,
			...props
		},
		ref
	) => {
		const selectId =
			props.id ||
			(label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

		return (
			<SelectGroup $isFullWidth={isFullWidth} className={className}>
				{label && (
					<SelectLabel
						htmlFor={selectId}
						$isInvalid={isInvalid}
						$isRequired={required}
					>
						{label}
					</SelectLabel>
				)}
				<StyledSelect
					ref={ref}
					id={selectId}
					$isInvalid={isInvalid}
					$isFullWidth={isFullWidth}
					$size={size}
					aria-invalid={isInvalid || undefined}
					aria-required={required || undefined}
					required={required}
					{...props}
				>
					{placeholder && (
						<option value='' disabled>
							{placeholder}
						</option>
					)}
					{options.length > 0
						? options.map((option) => (
								<option
									key={option.value}
									value={option.value}
									disabled={option.disabled}
								>
									{option.label}
								</option>
						  ))
						: children}
				</StyledSelect>
				{helperText && <SelectError>{helperText}</SelectError>}
			</SelectGroup>
		);
	}
);

Select.displayName = 'Select';

export default Select;
