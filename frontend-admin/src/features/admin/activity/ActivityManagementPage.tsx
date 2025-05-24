import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
	padding: 2rem 0;
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
`;

const H1 = styled.h1`
	margin-bottom: 0.5rem;
`;

const SubHeading = styled.p`
	color: #666;
	margin-bottom: 2rem;
`;

const Card = styled.div`
	background-color: white;
	border-radius: 8px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	padding: 1.5rem;
	margin-bottom: 2rem;
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1.5rem;
`;

const ActivityCard = styled.div`
	background-color: white;
	border: 1px solid #eee;
	border-radius: 8px;
	padding: 1.5rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	transition:
		transform 0.2s,
		box-shadow 0.2s;

	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
`;

const ActivityTitle = styled.h3`
	margin-bottom: 1rem;
`;

const ActivityDescription = styled.p`
	color: #666;
	margin-bottom: 1.5rem;
`;

const Button = styled.button`
	background-color: #0d6efd;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.5rem 1rem;
	cursor: pointer;
	font-weight: 600;

	&:hover {
		background-color: #0b5ed7;
	}
`;

export const ActivityManagementPage: React.FC = () => {
	return (
		<PageContainer>
			<PageHeader>
				<H1>Activity Management</H1>
				<SubHeading>
					Monitor and manage user activities across the platform
				</SubHeading>
			</PageHeader>

			<Card>
				<p>
					This dashboard allows you to monitor, analyze, and manage user
					activities across the PairFlix platform. Use the tools below to view
					different types of activity data and take administrative actions as
					needed.
				</p>
			</Card>

			<Grid>
				<ActivityCard>
					<ActivityTitle>Activity Logs</ActivityTitle>
					<ActivityDescription>
						View detailed activity logs of all user actions across the platform
						including logins, content interactions, and account changes.
					</ActivityDescription>
					<Button onClick={() => (window.location.href = '/admin/logs')}>
						View Logs
					</Button>
				</ActivityCard>

				<ActivityCard>
					<ActivityTitle>Audit Logs</ActivityTitle>
					<ActivityDescription>
						Access audit logs for administrative actions and system events to
						monitor platform security and compliance.
					</ActivityDescription>
					<Button
						onClick={() => (window.location.href = '/admin/logs?type=audit')}
					>
						View Audit Logs
					</Button>
				</ActivityCard>

				<ActivityCard>
					<ActivityTitle>User Sessions</ActivityTitle>
					<ActivityDescription>
						Monitor active user sessions, review session history, and manage or
						terminate suspicious sessions.
					</ActivityDescription>
					<Button
						onClick={() => (window.location.href = '/admin/users/sessions')}
					>
						Manage Sessions
					</Button>
				</ActivityCard>

				<ActivityCard>
					<ActivityTitle>Content Engagement</ActivityTitle>
					<ActivityDescription>
						View metrics on how users are engaging with content, including most
						watched items and engagement trends.
					</ActivityDescription>
					<Button
						onClick={() => (window.location.href = '/admin/stats/engagement')}
					>
						View Metrics
					</Button>
				</ActivityCard>
			</Grid>
		</PageContainer>
	);
};
