import {
	getMovieDetails,
	getPopular,
	getTVDetails,
	searchMedia,
} from './tmdb.service';

// Mock the global fetch function
global.fetch = jest.fn();

// Mock the dotenv config and environment variables
jest.mock('dotenv', () => ({
	config: jest.fn(),
}));

describe('TMDB Service', () => {
	const originalEnv = process.env;

	// Reset mocks between tests
	beforeEach(() => {
		jest.resetAllMocks();
		// Mock the TMDB_API_KEY directly in the module
		jest.mock(
			'./tmdb.service',
			() => {
				const original = jest.requireActual('./tmdb.service');
				return {
					...original,
					TMDB_API_KEY: 'test-api-key',
				};
			},
			{ virtual: true }
		);
	});

	// Check API error handling through searchMedia
	describe('Error handling', () => {
		it('should throw an error when API returns non-200 response', async () => {
			// Mock fetch to return an error
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: 'Not Found',
			});

			await expect(searchMedia('test')).rejects.toThrow(
				'TMDb API error: 404 Not Found'
			);
		});
	});

	describe('searchMedia', () => {
		it('should fetch search results for a query', async () => {
			const mockResponse = {
				results: [
					{ id: 1, title: 'Test Movie' },
					{ id: 2, name: 'Test TV Show' },
				],
			};

			// Mock successful fetch response
			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			const result = await searchMedia('test');
			expect(result).toEqual(mockResponse);

			// Don't test exact URL to avoid environment variable issues
			expect(global.fetch).toHaveBeenCalled();
			const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
			expect(url).toContain('/search/multi');
			expect(url).toContain('query=test');
			expect(url).toContain('page=1');
		});

		it('should support pagination', async () => {
			const mockResponse = { results: [] };

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			});

			await searchMedia('test', 2);

			// Don't test exact URL to avoid environment variable issues
			expect(global.fetch).toHaveBeenCalled();
			const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
			expect(url).toContain('/search/multi');
			expect(url).toContain('query=test');
			expect(url).toContain('page=2');
		});
	});

	describe('getMovieDetails', () => {
		it('should fetch details for a movie by ID', async () => {
			const mockMovieDetails = {
				id: 123,
				title: 'Test Movie',
				poster_path: '/path.jpg',
				overview: 'Test overview',
				status: 'Released',
			};

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockMovieDetails),
			});

			const result = await getMovieDetails(123);
			expect(result).toEqual(mockMovieDetails);

			// Don't test exact URL to avoid environment variable issues
			expect(global.fetch).toHaveBeenCalled();
			const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
			expect(url).toContain('/movie/123');
		});
	});

	describe('getTVDetails', () => {
		it('should fetch details for a TV show by ID', async () => {
			const mockTVDetails = {
				id: 456,
				name: 'Test TV Show',
				poster_path: '/path.jpg',
				overview: 'Test overview',
				status: 'Returning Series',
			};

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockTVDetails),
			});

			const result = await getTVDetails(456);
			expect(result).toEqual(mockTVDetails);

			// Don't test exact URL to avoid environment variable issues
			expect(global.fetch).toHaveBeenCalled();
			const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
			expect(url).toContain('/tv/456');
		});
	});

	describe('getPopular', () => {
		it('should fetch popular movies', async () => {
			const mockPopularMovies = {
				results: [
					{ id: 1, title: 'Popular Movie 1' },
					{ id: 2, title: 'Popular Movie 2' },
				],
			};

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockPopularMovies),
			});

			const result = await getPopular('movie');
			expect(result).toEqual(mockPopularMovies);

			// Don't test exact URL to avoid environment variable issues
			expect(global.fetch).toHaveBeenCalled();
			const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
			expect(url).toContain('/movie/popular');
			expect(url).toContain('page=1');
		});

		it('should fetch popular TV shows', async () => {
			const mockPopularTVShows = {
				results: [
					{ id: 3, name: 'Popular TV 1' },
					{ id: 4, name: 'Popular TV 2' },
				],
			};

			(global.fetch as jest.Mock).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockPopularTVShows),
			});

			const result = await getPopular('tv', 2);
			expect(result).toEqual(mockPopularTVShows);

			// Don't test exact URL to avoid environment variable issues
			expect(global.fetch).toHaveBeenCalled();
			const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
			expect(url).toContain('/tv/popular');
			expect(url).toContain('page=2');
		});
	});
});
