import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
	width: 100%;
`;

const TabsList = styled.div`
	display: flex;
	list-style: none;
	padding: 0;
	margin: 0;
`;

const Tab = styled.div<{ isActive?: boolean }>`
	flex: 1;
	padding: 10px;
	cursor: pointer;
	text-align: center;
	background-color: ${({ isActive }) => (isActive ? '#ddd' : 'transparent')};
`;

const TabContent = styled.div`
	padding: 10px;
	border: 1px solid #ddd;
	border-top: none;
`;

interface TabsProps {
	tabs: { label: string; content: React.ReactNode }[];
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(({ tabs }, ref) => {
	const [activeTab, setActiveTab] = useState(0);

	return (
		<TabsContainer ref={ref}>
			<TabsList>
				{tabs.map((tab, index) => (
					<Tab
						key={index}
						isActive={index === activeTab}
						onClick={() => setActiveTab(index)}
					>
						{tab.label}
					</Tab>
				))}
			</TabsList>
			<TabContent>{tabs[activeTab]?.content || null}</TabContent>
		</TabsContainer>
	);
});

export default Tabs;
