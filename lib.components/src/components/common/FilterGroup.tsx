import React, { createContext, useContext, useState } from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles/theme';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { Flex } from './Layout';
import { H2 } from './Typography';

// Types
export interface FilterGroupContextType {
	isDirty: boolean;
	setIsDirty: (dirty: boolean) => void;
}

export interface FilterGroupProps {
	title?: string | undefined;
	children: React.ReactNode;
	onApply: () => void;
	onClear: () => void;
	actionComponent?: React.ReactNode | undefined;
	defaultExpanded?: boolean | undefined;
	fullWidth?: boolean | undefined;
	disabled?: boolean | undefined;
	'aria-label'?: string | undefined;
}

export interface FilterItemProps {
	label: string;
	children: React.ReactNode;
	helpText?: string | undefined;
	required?: boolean | undefined;
	error?: string | undefined;
	fullWidth?: boolean | undefined;
}

// Context
const FilterGroupContext = createContext<FilterGroupContextType>({
	isDirty: false,
	setIsDirty: () => {},
});

// Styled Components
interface FilterGroupCardProps {
	$fullWidth?: boolean;
}

const FilterGroupCard = styled(Card)<FilterGroupCardProps>`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const FiltersGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: ${({ theme }: { theme: Theme }) => theme.spacing.md};
	margin-top: ${({ theme }: { theme: Theme }) => theme.spacing.md};

	@media (max-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.sm}) {
		grid-template-columns: 1fr;
	}
`;

const FilterHeader = styled(Flex)`
	margin-bottom: ${({ theme }: { theme: Theme }) => theme.spacing.md};
	border-bottom: 1px solid
		${({ theme }: { theme: Theme }) => theme.colors.border.light};
	padding-bottom: ${({ theme }: { theme: Theme }) => theme.spacing.sm};
`;

const FilterActions = styled(Flex)`
	margin-top: ${({ theme }) => theme.spacing.md};
	justify-content: space-between;
	flex-wrap: wrap;
	gap: ${({ theme }) => theme.spacing.sm};
`;

interface FilterContainerProps {
	$fullWidth?: boolean | undefined;
}

const FilterContainer = styled.div<FilterContainerProps>`
	width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const FilterContent = styled.div<{ isExpanded: boolean }>`
	max-height: ${({ isExpanded }) => (isExpanded ? '2000px' : '0')};
	opacity: ${({ isExpanded }) => (isExpanded ? '1' : '0')};
	overflow: hidden;
	transition: max-height 0.3s ease-in-out, opacity 0.2s ease-in-out;
	will-change: max-height, opacity;
`;

interface FilterLabelProps {
	$required?: boolean | undefined;
}

const FilterLabel = styled.label<FilterLabelProps>`
	display: block;
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	color: ${({ theme }) => theme.colors.text.secondary};

	${({ $required, theme }) =>
		$required
			? `
    &:after {
      content: '*';
      color: ${theme.colors.text.error};
      margin-left: 4px;
    }
  `
			: ''}
`;

const HelpText = styled.p`
	font-size: ${({ theme }: { theme: Theme }) => theme.typography.fontSize.xs};
	color: ${({ theme }: { theme: Theme }) => theme.colors.text.secondary};
	margin-top: ${({ theme }: { theme: Theme }) => theme.spacing.xs};
`;

const ErrorText = styled.p`
	font-size: ${({ theme }: { theme: Theme }) => theme.typography.fontSize.xs};
	color: ${({ theme }: { theme: Theme }) => theme.colors.text.error};
	margin-top: ${({ theme }: { theme: Theme }) => theme.spacing.xs};
`;

export const FilterGroup: React.FC<FilterGroupProps> = ({
	title = 'Filters',
	children,
	onApply,
	onClear,
	actionComponent,
	defaultExpanded = true,
	fullWidth = false,
	disabled = false,
	'aria-label': ariaLabel,
}) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const [isDirty, setIsDirty] = useState(false);

	const handleClear = () => {
		onClear();
		setIsDirty(false);
	};

	const handleApply = () => {
		onApply();
		setIsDirty(false);
	};

	return (
		<FilterGroupContext.Provider value={{ isDirty, setIsDirty }}>
			<FilterGroupCard
				$fullWidth={fullWidth}
				data-testid='filter-group'
				variant='outlined'
			>
				<CardContent>
					<FilterHeader justifyContent='space-between' alignItems='center'>
						<H2>{title}</H2>
						<Button
							variant='text'
							size='small'
							onClick={() => setIsExpanded(!isExpanded)}
							aria-expanded={isExpanded}
							aria-controls='filter-content'
						>
							{isExpanded ? 'Collapse' : 'Expand'}
						</Button>
					</FilterHeader>

					<FilterContent id='filter-content' isExpanded={isExpanded}>
						<FiltersGrid>{children}</FiltersGrid>

						<FilterActions>
							<div>
								<Button
									variant='primary'
									onClick={handleApply}
									disabled={disabled || !isDirty}
									style={{ marginRight: '0.5rem' }}
								>
									Apply Filters
								</Button>
								<Button
									variant='secondary'
									onClick={handleClear}
									disabled={disabled}
								>
									Clear Filters
								</Button>
							</div>

							{actionComponent}
						</FilterActions>
					</FilterContent>
				</CardContent>
			</FilterGroupCard>
		</FilterGroupContext.Provider>
	);
};

export const FilterItem: React.FC<FilterItemProps> = ({
	label,
	children,
	helpText,
	required,
	error,
	fullWidth,
}) => {
	const { setIsDirty } = useContext(FilterGroupContext);

	const handleChange = () => {
		setIsDirty(true);
	};

	// Fix: Use DOM onChange attribute properly
	const containerProps = {
		$fullWidth: fullWidth || false,
		'data-testid': 'filter-item',
	};

	return (
		<div {...containerProps} onChange={handleChange}>
			<FilterLabel htmlFor={`filter-${label}`} $required={required || false}>
				{label}
			</FilterLabel>
			{children}
			{helpText && <HelpText>{helpText}</HelpText>}
			{error && <ErrorText role='alert'>{error}</ErrorText>}
		</div>
	);
};

// Quick Filter component for common use cases
interface QuickFilterProps {
	label: string;
	options: Array<{ label: string; value: string }>;
	value: string;
	onChange: (value: string) => void;
}

export const QuickFilter: React.FC<QuickFilterProps> = ({
	label,
	options,
	value,
	onChange,
}) => {
	const { setIsDirty } = useContext(FilterGroupContext);

	const handleChange = (newValue: string) => {
		onChange(newValue);
		setIsDirty(true);
	};

	return (
		<FilterItem label={label}>
			<FilterActions>
				{options.map((option) => (
					<Button
						key={option.value}
						variant={value === option.value ? 'primary' : 'secondary'}
						size='small'
						onClick={() => handleChange(option.value)}
					>
						{option.label}
					</Button>
				))}
			</FilterActions>
		</FilterItem>
	);
};

export default FilterGroup;
