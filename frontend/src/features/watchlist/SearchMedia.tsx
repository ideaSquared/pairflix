import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/common/Button';
import { Card, CardContent, CardGrid } from '../../components/common/Card';
import { Input, InputGroup } from '../../components/common/Input';
import { ErrorText, H3, Typography } from '../../components/common/Typography';
import Badge from '../../components/layout/Badge';
import { search, SearchResult, watchlist } from '../../services/api';
import { theme } from '../../styles/theme';

const PosterImage = styled.img`
	width: 100%;
	height: 375px;
	object-fit: cover;
	border-radius: ${theme.borderRadius.sm};
`;

const Overview = styled(Typography).attrs({ variant: 'body2' })`
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	margin: ${theme.spacing.sm} 0;
`;

const SearchMedia: React.FC = () => {
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

			<CardGrid>
				{Array.isArray(searchResults) &&
					searchResults.map((result: SearchResult) => (
						<Card key={result.id}>
							<CardContent>
								{result.poster_path && (
									<PosterImage
										src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
										alt={result.title || result.name}
									/>
								)}
								<H3 gutterBottom>{result.title || result.name}</H3>
								<Badge variant={result.media_type}>{result.media_type}</Badge>
								<Overview>{result.overview}</Overview>
								<Button
									onClick={() => handleAdd(result)}
									disabled={addMutation.isLoading}
									fullWidth
								>
									Add to Watchlist
								</Button>
							</CardContent>
						</Card>
					))}

				{searchQuery.length > 2 &&
					!isLoading &&
					(!searchResults || searchResults.length === 0) && (
						<Typography>No results found</Typography>
					)}
			</CardGrid>
		</>
	);
};

export default SearchMedia;
