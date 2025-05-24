import React from 'react';
import styled from 'styled-components';

interface TabItem {
	id: string;
	label: string;
	disabled?: boolean;
}

interface TabsProps {
	tabs: TabItem[];
	activeTab: string;
	onChange: (tabId: string) => void;
	fullWidth?: boolean;
}

const TabsContainer = styled.div<{ fullWidth?: boolean }>`
	display: flex;
	overflow-x: auto;
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

	${({ fullWidth }) =>
		fullWidth &&
		`
    width: 100%;
    
    > * {
      flex: 1;
      text-align: center;
    }
  `}
`;

const TabButton = styled.button<{ active: boolean; disabled?: boolean }>`
	background: none;
	border: none;
	padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
	font-size: ${({ theme }) => theme.typography.fontSize.md};
	cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
	position: relative;
	color: ${({ active, theme, disabled }) =>
		disabled
			? theme.colors.text.disabled
			: active
				? theme.colors.text.secondary
				: theme.colors.text.primary};
	font-weight: ${({ active, theme }) =>
		active
			? theme.typography.fontWeight.bold
			: theme.typography.fontWeight.regular};
	opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
	transition: color 0.2s ease;

	&:hover {
		color: ${({ theme, disabled }) => !disabled && theme.colors.primary.main};
	}

	&:after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		width: 100%;
		height: 3px;
		background-color: ${({ theme }) => theme.colors.primary.main};
		opacity: ${({ active }) => (active ? 1 : 0)};
		transition: opacity 0.2s ease;
	}
`;

export const Tabs: React.FC<TabsProps> = ({
	tabs,
	activeTab,
	onChange,
	fullWidth = false,
}) => {
	return (
		<TabsContainer fullWidth={fullWidth}>
			{tabs.map((tab) => (
				<TabButton
					key={tab.id}
					active={activeTab === tab.id}
					disabled={tab.disabled || false}
					onClick={() => {
						if (!tab.disabled) {
							onChange(tab.id);
						}
					}}
				>
					{tab.label}
				</TabButton>
			))}
		</TabsContainer>
	);
};

export interface TabContentProps {
	children: React.ReactNode;
	className?: string;
}

export const TabContent = styled.div<TabContentProps>`
	padding: ${({ theme }) => theme.spacing.md};
`;

export { TabButton as Tab, TabsContainer as TabHeader };
