import { Card, Flex, Typography } from '@pairflix/components';
import React, { useState } from 'react';
import styled from 'styled-components';
import UserManagementContent from '../../../user-management/UserManagementContent';
import ContentModerationContent from '../content/ContentModerationContent';
import { PageHeader } from '../shared/PageHeader';

// Tab styles
const TabContainer = styled.div`
	display: flex;
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Tab = styled.div<{ active: boolean }>`
	padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
	cursor: pointer;
	font-weight: ${({ active }) => (active ? '600' : '400')};
	color: ${({ active, theme }) =>
		active ? theme.colors.primary : theme.colors.text};
	border-bottom: 2px solid
		${({ active, theme }) => (active ? theme.colors.primary : 'transparent')};
	transition: all 0.2s ease;

	&:hover {
		color: ${({ theme }) => theme.colors.primary};
	}
`;

const ContentManagement: React.FC = () => {
	const [activeTab, setActiveTab] = useState<'users' | 'content'>('users');

	return (
		<div>
			<PageHeader
				title='User & Content Management'
				description='Manage users and content across the platform'
				icon='fas fa-users-cog'
			/>

			<Card>
				<TabContainer>
					<Tab
						active={activeTab === 'users'}
						onClick={() => setActiveTab('users')}
					>
						<Flex alignItems='center' gap='sm'>
							<i className='fas fa-users'></i>
							<Typography>User Management</Typography>
						</Flex>
					</Tab>
					<Tab
						active={activeTab === 'content'}
						onClick={() => setActiveTab('content')}
					>
						<Flex alignItems='center' gap='sm'>
							<i className='fas fa-film'></i>
							<Typography>Content Moderation</Typography>
						</Flex>
					</Tab>
				</TabContainer>

				{activeTab === 'users' ? (
					<UserManagementContent />
				) : (
					<ContentModerationContent />
				)}
			</Card>
		</div>
	);
};

export default ContentManagement;
