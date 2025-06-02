import { Button, H1, Typography } from '@pairflix/components'
import React, { useState } from 'react';
import styled from 'styled-components';
;
;
import AuditLogContent from './activity/AuditLogContent';
import UserActivityContent from './activity/UserActivityContent';

// Styled components
const TabContainer = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing.sm};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
	padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const TabButton = styled(Button)<{ active: boolean }>`
	opacity: ${({ active }) => (active ? 1 : 0.7)};
	font-weight: ${({ active, theme }) =>
		active
			? theme.typography.fontWeight.bold
			: theme.typography.fontWeight.normal};
	background: ${({ active, theme }) =>
		active ? theme.colors.background.highlight : 'transparent'};
`;

const PageHeader = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Tab options for the activity page
type ActivityTab = 'audit' | 'user';

/**
 * Unified Activity Management component that combines audit logs and user activity
 */
const ActivityManagement: React.FC = () => {
	const [activeTab, setActiveTab] = useState<ActivityTab>('audit');

	const handleTabChange = (tab: ActivityTab) => {
		setActiveTab(tab);
	};

	return (
		<>
			<PageHeader>
				<H1 gutterBottom>Activity Management</H1>
				<Typography>
					View and filter system logs and user activity data to monitor platform
					usage.
				</Typography>
			</PageHeader>

			<TabContainer>
				<TabButton
					variant='text'
					active={activeTab === 'audit'}
					onClick={() => handleTabChange('audit')}
				>
					System Logs
				</TabButton>
				<TabButton
					variant='text'
					active={activeTab === 'user'}
					onClick={() => handleTabChange('user')}
				>
					User Activity
				</TabButton>
			</TabContainer>

			{activeTab === 'audit' && <AuditLogContent />}
			{activeTab === 'user' && <UserActivityContent />}
		</>
	);
};

export default ActivityManagement;
