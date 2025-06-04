import React, { forwardRef, useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { BaseComponentProps, Size } from '../../../types';

export interface SearchBarProps extends BaseComponentProps {
	/**
	 * Value of the search input
	 */
	value?: string;

	/**
	 * Placeholder text
	 */
	placeholder?: string;

	/**
	 * Callback when value changes
	 */
	onChange?: (value: string) => void;

	/**
	 * Callback when search is triggered (on enter or search button click)
	 */
	onSearch?: (value: string) => void;

	/**
	 * Whether to show the search button
	 * @default true
	 */
	showButton?: boolean;

	/**
	 * Custom text for the search button
	 * @default "Search"
	 */
	buttonText?: string;

	/**
	 * Whether to show a clear button when there's input
	 * @default true
	 */
	showClear?: boolean;

	/**
	 * Size of the search bar
	 * @default 'medium'
	 */
	size?: Size;

	/**
	 * Whether the search bar takes up the full width
	 * @default false
	 */
	isFullWidth?: boolean;

	/**
	 * Whether to auto-focus the input
	 * @default false
	 */
	autoFocus?: boolean;

	/**
	 * Debounce time in milliseconds for onChange
	 * @default 300
	 */
	debounceTime?: number;

	/**
	 * Whether the search bar is in an error state
	 * @default false
	 */
	isInvalid?: boolean;

	/**
	 * Aria label for the search input
	 */
	'aria-label'?: string;

	/**
	 * Whether the search bar is disabled
	 * @default false
	 */
	disabled?: boolean;
}

interface StyledInputProps {
	$size?: Size;
	$isFullWidth?: boolean;
	$isInvalid?: boolean;
	$hasButton?: boolean;
}

const SearchContainer = styled.div<{ $isFullWidth?: boolean }>`
	display: flex;
	align-items: center;
	width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : 'auto')};
	position: relative;
`;

const SearchInput = styled.input<StyledInputProps>`
	background: ${({ theme }) => theme.colors.background.input};
	color: ${({ theme }) => theme.colors.text.primary};
	border: 1px solid
		${({ theme, $isInvalid }) =>
			$isInvalid ? theme.colors.error : theme.colors.border.default};
	border-radius: ${({ theme, $hasButton }) =>
		$hasButton
			? `${theme.borderRadius.sm} 0 0 ${theme.borderRadius.sm}`
			: theme.borderRadius.sm};
	padding: ${({ theme, $size = 'medium' }) => {
		switch ($size) {
			case 'small':
				return `${theme.spacing.xs} ${theme.spacing.sm}`;
			case 'large':
				return `${theme.spacing.md} ${theme.spacing.lg}`;
			default:
				return `${theme.spacing.sm} ${theme.spacing.md}`;
		}
	}};
	width: ${({ $isFullWidth }) => ($isFullWidth ? '100%' : '300px')};
	font-size: ${({ theme, $size = 'medium' }) => {
		switch ($size) {
			case 'small':
				return theme.typography.fontSize.sm;
			case 'large':
				return theme.typography.fontSize.lg;
			default:
				return theme.typography.fontSize.md;
		}
	}};
	transition: all 0.2s ease-in-out;

	&:hover {
		border-color: ${({ theme, $isInvalid }) =>
			$isInvalid ? theme.colors.error : theme.colors.primary};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme, $isInvalid }) =>
			$isInvalid ? theme.colors.error : theme.colors.primary};
		box-shadow: 0 0 0 2px
			${({ theme, $isInvalid }) =>
				$isInvalid ? `${theme.colors.error}40` : `${theme.colors.primary}40`};
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.background.disabled};
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		width: 100%;
		font-size: ${({ theme }) => theme.typography.fontSize.md};
	}
`;

const SearchButton = styled.button<{ $size?: Size }>`
	background: ${({ theme }) => theme.colors.primary};
	color: white;
	border: 1px solid ${({ theme }) => theme.colors.primary};
	border-radius: 0 ${({ theme }) => theme.borderRadius.sm}
		${({ theme }) => theme.borderRadius.sm} 0;
	padding: ${({ theme, $size = 'medium' }) => {
		switch ($size) {
			case 'small':
				return `${theme.spacing.xs} ${theme.spacing.sm}`;
			case 'large':
				return `${theme.spacing.md} ${theme.spacing.lg}`;
			default:
				return `${theme.spacing.sm} ${theme.spacing.md}`;
		}
	}};
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	white-space: nowrap;
	font-size: ${({ theme, $size = 'medium' }) => {
		switch ($size) {
			case 'small':
				return theme.typography.fontSize.sm;
			case 'large':
				return theme.typography.fontSize.lg;
			default:
				return theme.typography.fontSize.md;
		}
	}};

	&:hover {
		background: ${({ theme }) => theme.colors.primaryHover};
		border-color: ${({ theme }) => theme.colors.primaryHover};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.primary};
		outline-offset: 2px;
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.background.disabled};
		border-color: ${({ theme }) => theme.colors.border.default};
		cursor: not-allowed;
		opacity: 0.6;
	}
`;

const ClearButton = styled.button<{ $size?: Size }>`
	position: absolute;
	right: ${({ $size = 'medium' }) => ($size === 'small' ? '8px' : '12px')};
	top: 50%;
	transform: translateY(-50%);
	background: none;
	border: none;
	color: ${({ theme }) => theme.colors.text.secondary};
	cursor: pointer;
	padding: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: color 0.2s ease-in-out;

	&:hover {
		color: ${({ theme }) => theme.colors.text.primary};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.primary};
		outline-offset: 2px;
		border-radius: ${({ theme }) => theme.borderRadius.sm};
	}
`;

/**
 * SearchBar component with built-in debouncing and clear functionality
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
	(
		{
			value,
			placeholder = 'Search...',
			onChange,
			onSearch,
			showButton = true,
			buttonText = 'Search',
			showClear = true,
			size = 'medium',
			isFullWidth = false,
			autoFocus = false,
			debounceTime = 300,
			isInvalid = false,
			disabled = false,
			className,
			'aria-label': ariaLabel,
			...props
		},
		ref
	) => {
		const [localValue, setLocalValue] = useState(value || '');
		const debounceTimeout = useRef<NodeJS.Timeout>();

		const handleChange = useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				const newValue = event.target.value;
				setLocalValue(newValue);

				if (onChange) {
					if (debounceTimeout.current) {
						clearTimeout(debounceTimeout.current);
					}

					debounceTimeout.current = setTimeout(() => {
						onChange(newValue);
					}, debounceTime);
				}
			},
			[onChange, debounceTime]
		);

		const handleClear = useCallback(() => {
			setLocalValue('');
			if (onChange) {
				onChange('');
			}
			if (ref && 'current' in ref && ref.current) {
				ref.current.focus();
			}
		}, [onChange, ref]);

		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLInputElement>) => {
				if (event.key === 'Enter' && onSearch) {
					onSearch(localValue);
				}
			},
			[localValue, onSearch]
		);

		// Clean up timeout on unmount
		React.useEffect(() => {
			return () => {
				if (debounceTimeout.current) {
					clearTimeout(debounceTimeout.current);
				}
			};
		}, []);

		// Update local value when prop changes
		React.useEffect(() => {
			if (value !== undefined) {
				setLocalValue(value);
			}
		}, [value]);

		return (
			<SearchContainer className={className} $isFullWidth={isFullWidth}>
				<SearchInput
					ref={ref}
					type='text'
					value={localValue}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					$size={size}
					$isFullWidth={isFullWidth}
					$isInvalid={isInvalid}
					$hasButton={showButton}
					disabled={disabled}
					aria-label={ariaLabel || 'Search input'}
					{...props}
				/>
				{showClear && localValue && !disabled && (
					<ClearButton
						onClick={handleClear}
						$size={size}
						type='button'
						aria-label='Clear search'
					>
						×
					</ClearButton>
				)}
				{showButton && (
					<SearchButton
						onClick={() => onSearch?.(localValue)}
						$size={size}
						disabled={disabled}
						type='button'
						aria-label={buttonText}
					>
						{buttonText}
					</SearchButton>
				)}
			</SearchContainer>
		);
	}
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
