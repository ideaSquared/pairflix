import React from 'react';
import styled from 'styled-components';

export interface TabItem {
	id: string;
	label: string;
	disabled?: boolean;
	icon?: React.ReactNode;
	tooltip?: string; // Added tooltip support
}

export interface TabsProps {
	tabs: TabItem[];
	activeTab: string;
	onChange: (tabId: string) => void;
	fullWidth?: boolean;
	vertical?: boolean;
	ariaLabel?: string;
	className?: string; // Added className support
}

const TabsContainer = styled.div<{
	fullWidth?: boolean;
	vertical?: boolean;
}>`
	display: flex;
	flex-direction: ${({ vertical }) => (vertical ? 'column' : 'row')};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	border-bottom: ${({ vertical, theme }) =>
		vertical ? 'none' : `1px solid ${theme.colors.gray[200]}`};
	border-right: ${({ vertical, theme }) =>
		vertical ? `1px solid ${theme.colors.gray[200]}` : 'none'};
	background-color: ${({ theme }) => theme.colors.white};

	${({ theme }) => theme.breakpoints.mobile} {
		overflow-x: auto;
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}
`;

const TabButton = styled.button<{
	active: boolean;
	disabled?: boolean;
	vertical?: boolean;
}>`
	// ...existing code for TabButton styled component...
`;

/**
 * Tabs component for navigation between different sections.
 * Supports horizontal and vertical layouts, icons, tooltips, and full accessibility.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
	(
		{
			tabs,
			activeTab,
			onChange,
			fullWidth = false,
			vertical = false,
			ariaLabel = 'Navigation tabs',
			className,
		},
		ref
	) => {
		return (
			<TabsContainer
				ref={ref}
				fullWidth={fullWidth}
				vertical={vertical}
				role='tablist'
				aria-label={ariaLabel}
				className={className}
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
						title={tab.tooltip} // Added tooltip support
					>
						{tab.icon && tab.icon}
						{tab.label}
					</TabButton>
				))}
			</TabsContainer>
		);
	}
);

Tabs.displayName = 'Tabs';

// ...existing TabContent and TabPanel components...

// Export individual components
export { TabButton as Tab, TabsContainer as TabHeader };
