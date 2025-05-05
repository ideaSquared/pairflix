import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDbResponse<T> {
	results?: T[];
	status_message?: string;
}

async function tmdbFetch<T>(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<T> {
	const searchParams = new URLSearchParams({
		api_key: TMDB_API_KEY || '',
		...params,
	});

	const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);

	if (!response.ok) {
		throw new Error(
			`TMDb API error: ${response.status} ${response.statusText}`
		);
	}

	return response.json();
}

export async function searchMedia(query: string, page: number = 1) {
	return tmdbFetch<TMDbResponse<any>>('/search/multi', {
		query,
		page: page.toString(),
	});
}

export async function getMovieDetails(movieId: number) {
	return tmdbFetch(`/movie/${movieId}`);
}

export async function getTVDetails(tvId: number) {
	return tmdbFetch(`/tv/${tvId}`);
}

export async function getPopular(mediaType: 'movie' | 'tv', page: number = 1) {
	return tmdbFetch<TMDbResponse<any>>(`/${mediaType}/popular`, {
		page: page.toString(),
	});
}
