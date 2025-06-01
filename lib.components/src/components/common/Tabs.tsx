import React from 'react';
import styled from 'styled-components';

interface TabItem {
	id: string;
	label: string;
	disabled?: boolean;
	icon?: React.ReactNode; // Optional icon for tab
}

interface TabsProps {
	tabs: TabItem[];
	activeTab: string;
	onChange: (tabId: string) => void;
	fullWidth?: boolean;
	vertical?: boolean; // Optional prop for vertical tabs layout
	ariaLabel?: string; // For accessibility
}

const TabsContainer = styled.div<{ fullWidth?: boolean; vertical?: boolean }>`
	display: flex;
	overflow-x: auto;
	border-bottom: ${({ vertical, theme }) =>
		vertical ? 'none' : `1px solid ${theme.colors.border.light || '#e0e0e0'}`};
	flex-direction: ${({ vertical }) => (vertical ? 'column' : 'row')};

	${({ vertical, theme }) =>
		vertical &&
		`
		border-right: 1px solid ${theme.colors.border.light || '#e0e0e0'};
		height: 100%;
		min-width: 150px;
	`}

	${({ fullWidth }) =>
		fullWidth &&
		`
    width: 100%;
    
    > * {
      flex: 1;
      text-align: center;
    }
  `}
  
  /* Responsive styling for mobile */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		overflow-x: ${({ vertical }) => (vertical ? 'visible' : 'auto')};

		/* Switch to horizontal scroll on mobile for vertical tabs */
		${({ vertical }) =>
			vertical &&
			`
      flex-direction: row;
      border-right: none;
      border-bottom: 1px solid #e0e0e0;
      min-width: unset;
    `}
	}
`;

const TabButton = styled.button<{
	active: boolean;
	disabled?: boolean;
	vertical?: boolean;
}>`
	background: none;
	border: none;
	padding: ${({ theme }) =>
		`${theme.spacing.md || '12px'} ${theme.spacing.lg || '16px'}`};
	font-size: ${({ theme }) => theme.typography.fontSize.md || '16px'};
	cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
	position: relative;
	color: ${({ active, theme, disabled }) =>
		disabled
			? theme.colors.text.disabled || '#a0a0a0'
			: active
			? theme.colors.text.secondary || '#444'
			: theme.colors.text.primary || '#222'};
	font-weight: ${({ active, theme }) =>
		active
			? theme.typography.fontWeight.bold || '700'
			: theme.typography.fontWeight.regular || '400'};
	opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
	transition: color 0.2s ease;
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm || '8px'};
	white-space: nowrap;

	&:hover {
		color: ${({ theme, disabled }) =>
			!disabled && (theme.colors.primary.main || '#0077cc')};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.primary.main || '#0077cc'};
		outline-offset: -2px;
		border-radius: 2px;
	}

	&:after {
		content: '';
		position: absolute;
		${({ vertical }) =>
			vertical
				? `
				top: 0;
				right: -1px;
				height: 100%;
				width: 3px;
				`
				: `
				bottom: -1px;
				left: 0;
				width: 100%;
				height: 3px;
				`}
		background-color: ${({ theme }) => theme.colors.primary.main || '#0077cc'};
		opacity: ${({ active }) => (active ? 1 : 0)};
		transition: opacity 0.2s ease;
	}

	/* Responsive styling for mobile */
	@media (max-width: ${({ theme }) => theme.breakpoints.sm || '576px'}) {
		padding: ${({ theme }) =>
			`${theme.spacing.sm || '8px'} ${theme.spacing.md || '12px'}`};

		/* Adjust indicator for vertical tabs on mobile */
		${({ vertical }) =>
			vertical &&
			`
			&:after {
				bottom: -1px;
				left: 0;
				width: 100%;
				height: 3px;
				top: auto;
				right: auto;
			}
			`}
	}
`;

/**
 * Tabs component for navigation between different sections
 */
export const Tabs: React.FC<TabsProps> = ({
	tabs,
	activeTab,
	onChange,
	fullWidth = false,
	vertical = false,
	ariaLabel = 'Navigation tabs',
}) => {
	return (
		<TabsContainer
			fullWidth={fullWidth}
			vertical={vertical}
			role='tablist'
			aria-label={ariaLabel}
		>
			{tabs.map((tab) => (
				<TabButton
					key={tab.id}
					active={activeTab === tab.id}
					disabled={tab.disabled || false}
					vertical={vertical}
					onClick={() => {
						if (!tab.disabled) {
							onChange(tab.id);
						}
					}}
					role='tab'
					aria-selected={activeTab === tab.id}
					aria-controls={`${tab.id}-panel`}
					id={`${tab.id}-tab`}
				>
					{tab.icon && tab.icon}
					{tab.label}
				</TabButton>
			))}
		</TabsContainer>
	);
};

export interface TabContentProps {
	children: React.ReactNode;
	className?: string;
	id?: string; // For accessibility
	activeTabId?: string; // For accessibility
}

export const TabContent = styled.div<TabContentProps>`
	padding: ${({ theme }) => theme.spacing.md || '12px'};
`;

// TabPanel component for accessibility
export const TabPanel: React.FC<TabContentProps> = ({
	children,
	className,
	id,
	activeTabId,
}) => {
	return (
		<div
			className={className}
			role='tabpanel'
			id={`${id}-panel`}
			aria-labelledby={`${id}-tab`}
			hidden={id !== activeTabId}
		>
			{id === activeTabId && children}
		</div>
	);
};

// Export individual components
export { TabButton as Tab, TabsContainer as TabHeader };
