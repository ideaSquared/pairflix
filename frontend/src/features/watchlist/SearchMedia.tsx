import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import styled from 'styled-components';
import { search, SearchResult, watchlist } from '../../services/api';

const SearchContainer = styled.div`
	margin-bottom: 2rem;
`;

const SearchGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
	margin-top: 1rem;
`;

const SearchCard = styled.div`
	background: #1a1a1a;
	border-radius: 8px;
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
`;

const PosterImage = styled.img`
	width: 100%;
	height: 375px;
	object-fit: cover;
	border-radius: 4px;
`;

const Button = styled.button`
	background: #646cff;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 0.5rem;
	cursor: pointer;
	&:hover {
		background: #747bff;
	}
	&:disabled {
		background: #4a4a4a;
		cursor: not-allowed;
	}
`;

const SearchInput = styled.input`
	width: 100%;
	padding: 0.5rem;
	margin-bottom: 1rem;
	border: 1px solid #3a3a3a;
	border-radius: 4px;
	background: #2a2a2a;
	color: white;
	&:focus {
		outline: none;
		border-color: #646cff;
	}
`;

const Overview = styled.p`
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
`;

const SearchMedia: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const queryClient = useQueryClient();

	const { data: results = [], isLoading } = useQuery(
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
		<SearchContainer>
			<SearchInput
				type='text'
				placeholder='Search for movies or TV shows...'
				value={searchQuery}
				onChange={handleSearch}
			/>
			{isLoading && <div>Loading...</div>}
			<SearchGrid>
				{results.map((result) => (
					<SearchCard key={result.id}>
						{result.poster_path && (
							<PosterImage
								src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
								alt={result.title || result.name}
							/>
						)}
						<h3>{result.title || result.name}</h3>
						<p>Type: {result.media_type}</p>
						<Overview>{result.overview}</Overview>
						<Button
							onClick={() => handleAdd(result)}
							disabled={addMutation.isLoading}
						>
							Add to Watchlist
						</Button>
					</SearchCard>
				))}
			</SearchGrid>
		</SearchContainer>
	);
};

export default SearchMedia;
