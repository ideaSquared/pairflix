import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
	baseURL: BASE_URL,
	params: {
		api_key: TMDB_API_KEY,
	},
});

export const searchContent = async (query: string, page = 1) => {
	const response = await tmdbApi.get('/search/multi', {
		params: {
			query,
			page,
		},
	});
	return response.data;
};

export const getMovieDetails = async (movieId: number) => {
	const response = await tmdbApi.get(`/movie/${movieId}`);
	return response.data;
};

export const getTvShowDetails = async (tvId: number) => {
	const response = await tmdbApi.get(`/tv/${tvId}`);
	return response.data;
};

export const getRecommendations = async (
	mediaType: 'movie' | 'tv',
	id: number
) => {
	const response = await tmdbApi.get(`/${mediaType}/${id}/recommendations`);
	return response.data;
};
