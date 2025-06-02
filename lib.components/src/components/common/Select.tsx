import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../styles/theme';

export interface SelectOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

export type SelectSize = 'small' | 'medium' | 'large';

interface BaseSelectProps {
	fullWidth?: boolean | undefined;
	error?: boolean | undefined;
	size?: SelectSize | undefined;
	options?: SelectOption[] | undefined;
	label?: string | undefined;
	helperText?: string | undefined;
	required?: boolean | undefined;
}

// Main props including HTML select props, but omitting conflicting ones
export interface SelectProps
	extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
		BaseSelectProps {}

// Props for styled components using transient props
interface StyledSelectProps {
	$fullWidth?: boolean | undefined;
	$error?: boolean | undefined;
	$size?: SelectSize | undefined;
}

const getSelectPadding = (size: SelectSize = 'medium') => {
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

const getSelectHeight = (size: SelectProps['size'] = 'medium') => {
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
		${({ $error, theme }) =>
			$error ?? false
				? theme.colors.text.error || '#f44336'
				: theme.colors.border || '#e0e0e0'};
	border-radius: ${({ theme }) => theme.borderRadius.sm || '4px'};
	${({ $size }) => getSelectPadding($size ?? 'medium')};
	width: ${({ $fullWidth }) => ($fullWidth ?? false ? '100%' : 'auto')};
	height: ${({ $size }) => getSelectHeight($size ?? 'medium')};
	font-size: ${({ theme, $size }) =>
		($size ?? 'medium') === 'small'
			? theme.typography.fontSize.sm || '14px'
			: ($size ?? 'medium') === 'large'
			? theme.typography.fontSize.lg || '18px'
			: theme.typography.fontSize.md || '16px'};
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	padding-right: ${({ theme }) =>
		theme.spacing.xl || '24px'}; // Space for arrow

	&:hover:not(:disabled) {
		border-color: ${({ $error, theme }) =>
			$error ?? false
				? theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
	}

	&:focus {
		outline: none;
		border-color: ${({ $error, theme }) =>
			$error ?? false
				? theme.colors.text.error || '#f44336'
				: theme.colors.primary || '#0077cc'};
		box-shadow: 0 0 0 2px
			${({ $error, theme }) =>
				$error ?? false
					? `${theme.colors.text.error || '#f44336'}40`
					: `${theme.colors.primary || '#0077cc'}40`};
	}

	&:focus-visible {
		outline: 2px solid
			${({ $error, theme }) =>
				$error ?? false
					? theme.colors.text.error || '#f44336'
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

	@media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		width: 100%;
		min-height: 44px;
		font-size: ${({ theme }) => theme.typography.fontSize.md || '16px'};
	}
`;

export const SelectLabel = styled.label<{
	$error?: boolean;
	$required?: boolean;
}>`
	display: block;
	margin-bottom: ${({ theme }) => theme.spacing.xs || '4px'};
	color: ${({ theme, $error }) =>
		$error ?? false
			? theme.colors.text.error || '#f44336'
			: theme.colors.text.primary || '#000000'};
	font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium || '500'};

	${({ $required, theme }) =>
		$required ?? false
			? `
		&:after {
			content: " *";
			color: ${theme.colors.text.error || '#f44336'};
		}
	`
			: ''}

	@media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		margin-bottom: calc(${({ theme }) => theme.spacing.xs || '4px'} * 0.8);
	}
`;

export const SelectError = styled.span`
	display: block;
	color: ${({ theme }) => theme.colors.text.error || '#f44336'};
	font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
	margin-top: ${({ theme }) => theme.spacing.xs || '4px'};
`;

export const SelectGroup = styled.div<{ fullWidth?: boolean }>`
	display: flex;
	flex-direction: column;
	width: ${({ fullWidth }) => (fullWidth ?? false ? '100%' : 'auto')};
	margin-bottom: ${({ theme }) => theme.spacing.md || '12px'};

	@media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		width: 100%;
		margin-bottom: ${({ theme }) => theme.spacing.sm || '8px'};
	}
`;

/**
 * Select component with support for options, label, and error states
 */
export const Select = ({
	label,
	error = false,
	helperText,
	required = false,
	fullWidth = false,
	options = [],
	id,
	children,
	size = 'medium',
	...props
}: SelectProps) => {
	const selectId =
		id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

	return (
		<SelectGroup fullWidth={fullWidth}>
			{label && (
				<SelectLabel htmlFor={selectId} $error={error} $required={required}>
					{label}
				</SelectLabel>
			)}
			<StyledSelect
				id={selectId}
				$error={error}
				$fullWidth={fullWidth}
				$size={size}
				aria-invalid={error ? 'true' : 'false'}
				aria-required={required}
				required={required}
				{...props}
			>
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
};

/**
 * Select component specifically for sizes (e.g., Small, Medium, Large)
 */
export const SizeSelect: React.FC<Omit<SelectProps, 'options'>> = (props) => {
	const sizeOptions: SelectOption[] = [
		{ value: 'small', label: 'Small' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'large', label: 'Large' },
	];

	return <Select options={sizeOptions} {...props} />;
};

/**
 * Select component specifically for status selection
 */
export const StatusSelect: React.FC<Omit<SelectProps, 'options'>> = (props) => {
	const statusOptions: SelectOption[] = [
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'archived', label: 'Archived' },
	];

	return <Select options={statusOptions} {...props} />;
};
