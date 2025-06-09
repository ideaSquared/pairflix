import * as dotenv from 'dotenv';

dotenv.config();

const { TMDB_API_KEY } = process.env;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface TMDbResponse<T> {
	results?: T[];
	status_message?: string;
}

export interface TMDbMovie {
	id: number;
	title: string;
	poster_path: string | null;
	overview: string;
	status: string;
}

export interface TMDbTV {
	id: number;
	name: string;
	poster_path: string | null;
	overview: string;
	status: string;
}

export type TMDbDetails = TMDbMovie | TMDbTV;

async function tmdbFetch<T>(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<T> {
	const searchParams = new URLSearchParams({
		api_key: TMDB_API_KEY ?? '',
		...params,
	});

	const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);

	if (!response.ok) {
		throw new Error(
			`TMDb API error: ${response.status} ${response.statusText}`
		);
	}

	return response.json() as Promise<T>;
}

export async function searchMedia(query: string, page: number = 1) {
	return tmdbFetch<TMDbResponse<TMDbMovie | TMDbTV>>('/search/multi', {
		query,
		page: page.toString(),
	});
}

export async function getMovieDetails(movieId: number): Promise<TMDbMovie> {
	return tmdbFetch<TMDbMovie>(`/movie/${movieId}`);
}

export async function getTVDetails(tvId: number): Promise<TMDbTV> {
	return tmdbFetch<TMDbTV>(`/tv/${tvId}`);
}

export async function getPopular(mediaType: 'movie' | 'tv', page: number = 1) {
	return tmdbFetch<TMDbResponse<TMDbMovie | TMDbTV>>(`/${mediaType}/popular`, {
		page: page.toString(),
	});
}
