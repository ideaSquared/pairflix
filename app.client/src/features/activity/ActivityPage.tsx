import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/layout/Layout';
import ActivityFeed from './ActivityFeed';

const PageContainer = styled.div`
	padding: 2rem 1rem;

	@media (max-width: 768px) {
		padding: 1rem 0.5rem;
	}
`;

const PageHeader = styled.div`
	margin-bottom: 2rem;
	text-align: center;
`;

const Title = styled.h1`
	font-size: ${(props) => props.theme.fontSizes.xl};
	color: ${(props) => props.theme.colors.textPrimary};
	margin-bottom: 0.5rem;

	@media (max-width: 768px) {
		font-size: ${(props) => props.theme.fontSizes.lg};
	}
`;

const Description = styled.p`
	font-size: ${(props) => props.theme.fontSizes.md};
	color: ${(props) => props.theme.colors.textSecondary};
	max-width: 600px;
	margin: 0 auto;

	@media (max-width: 768px) {
		font-size: ${(props) => props.theme.fontSizes.sm};
	}
`;

const ActivityPage: React.FC = () => {
	return (
		<Layout>
			<PageContainer>
				<PageHeader>
					<Title>Activity Feed</Title>
					<Description>
						See what your partner has been watching and their recent activity.
					</Description>
				</PageHeader>

				<ActivityFeed limit={30} />
			</PageContainer>
		</Layout>
	);
};

export default ActivityPage;
