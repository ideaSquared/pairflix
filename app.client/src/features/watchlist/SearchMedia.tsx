import { Badge, Button, Card, CardContent, CardGrid, ErrorText, H3, Input, InputGroup, Typography } from '@pairflix/components'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
;
;
;
;
;
import { useAuth } from '../../hooks/useAuth';
import { search, SearchResult, watchlist } from '../../services/api';

const PosterImage = styled.img`
	width: 100%;
	max-width: ${({ $isListView }: { $isListView?: boolean }) =>
		$isListView ? '150px' : '100%'};
	height: ${({ $isListView }: { $isListView?: boolean }) =>
		$isListView ? '225px' : '300px'}; // Reduced height for better proportions
	object-fit: cover;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const Overview = styled(Typography).attrs({ variant: 'body2' })`
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	margin: ${({ theme }) => theme.spacing.sm} 0;
`;

const ListViewItem = styled(Card).attrs({
	variant: 'primary',
})`
	display: flex;
	margin-bottom: ${({ theme }) => theme.spacing.md};

	${CardContent} {
		flex: 1;
		display: flex;
		gap: ${({ theme }) => theme.spacing.lg};

		.content {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		.actions {
			display: flex;
			align-items: center;
			padding-left: ${({ theme }) => theme.spacing.md};
		}
	}
`;

const GridContainer = styled(CardGrid)`
	margin-top: ${({ theme }) => theme.spacing.lg};
	display: grid;
	grid-template-columns: repeat(
		auto-fill,
		minmax(280px, 1fr)
	); // Base size adjusted
	gap: ${({ theme }) => theme.spacing.md};

	/* Better utilization of screen space across different devices */
	@media (min-width: 1200px) {
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	}

	/* For larger screens, allow even more cards per row */
	@media (min-width: 1600px) {
		grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
	}

	/* For extra large screens, maximize content density */
	@media (min-width: 2000px) {
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	}
`;

const ListContainer = styled.div`
	margin-top: ${({ theme }) => theme.spacing.lg};
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.md};
`;

const EnhancedListViewItem = styled(ListViewItem)`
	width: 100%;

	.content {
		flex: 3;
	}

	.actions {
		flex: 1;
		justify-content: flex-end;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		${CardContent} {
			flex-direction: column;

			.actions {
				padding-left: 0;
				padding-top: ${({ theme }) => theme.spacing.md};
			}
		}
	}
`;

const SearchMedia: React.FC = () => {
	const { user } = useAuth();
	const viewStyle = user?.preferences?.viewStyle || 'grid';
	const [searchQuery, setSearchQuery] = useState('');
	const queryClient = useQueryClient();

	const {
		data: searchResults = [],
		isLoading,
		error,
	} = useQuery<SearchResult[]>(
		['search', searchQuery],
		() => search.media(searchQuery),
		{
			enabled: searchQuery.length > 2,
		}
	);

	const addMutation = useMutation(
		(entry: SearchResult) =>
			watchlist.add({
				tmdb_id: entry.id,
				media_type: entry.media_type,
				status: 'to_watch',
			}),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['watchlist']);
			},
		}
	);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleAdd = (result: SearchResult) => {
		addMutation.mutate(result);
	};

	const renderSearchResult = (result: SearchResult) => {
		const commonContent = (
			<>
				{result.poster_path && (
					<PosterImage
						src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
						alt={result.title || result.name}
						$isListView={viewStyle === 'list'}
					/>
				)}
				<div className='content'>
					<H3 gutterBottom>{result.title || result.name}</H3>
					<Badge variant='primary'>
						{result.media_type === 'tv' ? 'TV Series' : 'Movie'}
					</Badge>
					<Overview>{result.overview}</Overview>
				</div>
				<div className='actions'>
					<Button
						onClick={() => handleAdd(result)}
						disabled={addMutation.isLoading}
					>
						Add to Watchlist
					</Button>
				</div>
			</>
		);

		return viewStyle === 'grid' ? (
			<Card key={result.id} variant='primary'>
				<CardContent>{commonContent}</CardContent>
			</Card>
		) : (
			<EnhancedListViewItem key={result.id} variant='primary'>
				<CardContent>{commonContent}</CardContent>
			</EnhancedListViewItem>
		);
	};

	return (
		<>
			<InputGroup fullWidth>
				<Input
					type='text'
					placeholder='Search for movies or TV shows...'
					value={searchQuery}
					onChange={handleSearch}
					fullWidth
				/>
			</InputGroup>

			{error instanceof Error && (
				<ErrorText gutterBottom>
					{error.message || 'An error occurred while searching'}
				</ErrorText>
			)}

			{isLoading && searchQuery.length > 2 && (
				<Typography>Loading...</Typography>
			)}

			{viewStyle === 'grid' ? (
				<GridContainer>
					{searchResults?.map((result) =>
						result ? renderSearchResult(result) : null
					)}
				</GridContainer>
			) : (
				<ListContainer>
					{searchResults?.map((result) =>
						result ? renderSearchResult(result) : null
					)}
				</ListContainer>
			)}

			{searchQuery.length > 2 &&
				!isLoading &&
				(!searchResults || searchResults.length === 0) && (
					<Typography>No results found</Typography>
				)}
		</>
	);
};

export default SearchMedia;
