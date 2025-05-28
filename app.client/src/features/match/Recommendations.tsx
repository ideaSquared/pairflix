import { useQuery } from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components';
import { Badge } from '../../components/common/Badge';
import { Card, CardContent } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { H2, Typography } from '../../components/common/Typography';
import { matches } from '../../services/api/matches';

const RecommendationsContainer = styled.div`
	margin-top: 2rem;
`;

const RecommendationsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1.5rem;
	margin-top: 1rem;

	@media (max-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1rem;
	}
`;

const RecommendationCard = styled(Card).attrs(() => ({
	variant: 'primary' as const,
}))`
	display: flex;
	flex-direction: column;
	height: 100%;
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-4px);
	}
`;

const CardHeader = styled.div`
	position: relative;
	aspect-ratio: 2/3;
	overflow: hidden;
	border-top-left-radius: ${(props) => props.theme.borderRadius.md};
	border-top-right-radius: ${(props) => props.theme.borderRadius.md};
`;

const PosterImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const ScoreBadge = styled.div`
	position: absolute;
	top: 0.5rem;
	right: 0.5rem;
	background: ${(props) => props.theme.colors.primary};
	color: white;
	border-radius: ${(props) => props.theme.borderRadius.full};
	padding: 0.5rem;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const CardBody = styled(CardContent)`
	flex: 1;
	display: flex;
	flex-direction: column;
`;

const ContentTitle = styled(Typography)`
	font-weight: bold;
	margin: 0.5rem 0;
	font-size: ${(props) => props.theme.fontSizes.lg};
`;

const ReasonText = styled(Typography)`
	margin-top: auto;
	color: ${(props) => props.theme.colors.textSecondary};
	font-style: italic;
	font-size: ${(props) => props.theme.fontSizes.sm};
`;

const EmptyState = styled.div`
	text-align: center;
	padding: 3rem 1rem;
	color: ${(props) => props.theme.colors.textSecondary};
`;

interface RecommendationsProps {
	limit?: number;
}

const Recommendations: React.FC<RecommendationsProps> = ({ limit = 6 }) => {
	const {
		data: recommendations,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['recommendations', limit],
		queryFn: () => matches.getRecommendations(limit),
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return (
			<EmptyState>
				<Typography>Unable to load recommendations at this time.</Typography>
			</EmptyState>
		);
	}

	if (!recommendations || recommendations.length === 0) {
		return (
			<EmptyState>
				<Typography>
					No recommendations available yet. Keep updating your watchlist to get
					personalized suggestions!
				</Typography>
			</EmptyState>
		);
	}

	return (
		<RecommendationsContainer>
			<H2>Recommended For You Both</H2>
			<Typography variant='body2' gutterBottom>
				Content you might enjoy watching together based on your preferences
			</Typography>

			<RecommendationsGrid>
				{recommendations.map((item) => (
					<RecommendationCard key={`${item.media_type}-${item.tmdb_id}`}>
						<CardHeader>
							{item.poster_path ? (
								<PosterImage
									src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
									alt={item.title}
								/>
							) : (
								<div
									style={{
										background: '#2a2a2a',
										width: '100%',
										height: '100%',
									}}
								/>
							)}
							<ScoreBadge>
								{Math.round(item.recommendation_score * 100)}%
							</ScoreBadge>
						</CardHeader>

						<CardBody>
							<ContentTitle variant='h3'>{item.title}</ContentTitle>
							<Badge variant='primary'>
								{item.media_type === 'tv' ? 'TV Series' : 'Movie'}
							</Badge>
							<ReasonText>{item.recommendation_reason}</ReasonText>
						</CardBody>
					</RecommendationCard>
				))}
			</RecommendationsGrid>
		</RecommendationsContainer>
	);
};

export default Recommendations;
