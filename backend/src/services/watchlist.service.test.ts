import { getMovieDetails, getTVDetails } from './tmdb.service';
import {
	addToWatchlistService,
	getMatchesService,
	getWatchlistService,
	updateWatchlistEntryService,
} from './watchlist.service';

// Mock the models and services
jest.mock('../models/WatchlistEntry', () => ({
	__esModule: true,
	default: {
		create: jest.fn(),
		findAll: jest.fn(),
		update: jest.fn(),
		findByPk: jest.fn(),
	},
}));

jest.mock('../models/Match', () => ({
	__esModule: true,
	default: {
		findAll: jest.fn(),
	},
}));

jest.mock('./tmdb.service', () => ({
	getMovieDetails: jest.fn(),
	getTVDetails: jest.fn(),
}));

import Match from '../models/Match';
import WatchlistEntry from '../models/WatchlistEntry';

// Create a mock authenticated user with all required properties
const mockAuthUser = {
	user_id: 'user-1',
	email: 'user1@example.com',
	username: 'testuser1',
};

describe('Watchlist Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('addToWatchlistService', () => {
		it('should add an entry to the watchlist', async () => {
			const mockEntry = {
				entry_id: 'entry-1',
				user_id: 'user-1',
				tmdb_id: 123,
				media_type: 'movie',
				status: 'to_watch',
				notes: 'Test notes',
			};
			(WatchlistEntry.create as jest.Mock).mockResolvedValue(mockEntry);

			const entry = await addToWatchlistService(mockAuthUser, {
				tmdb_id: 123,
				media_type: 'movie',
				status: 'to_watch',
				notes: 'Test notes',
			});

			expect(entry).toEqual(mockEntry);

			expect(WatchlistEntry.create).toHaveBeenCalledWith({
				user_id: 'user-1',
				tmdb_id: 123,
				media_type: 'movie',
				status: 'to_watch',
				notes: 'Test notes',
			});
		});
	});

	describe('getWatchlistService', () => {
		it('should return enriched watchlist entries for movies', async () => {
			const mockEntries = [
				{
					entry_id: 'entry-1',
					tmdb_id: 123,
					media_type: 'movie',
					status: 'to_watch',
					toJSON: () => ({
						entry_id: 'entry-1',
						tmdb_id: 123,
						media_type: 'movie',
						status: 'to_watch',
					}),
				},
			];
			const mockDetails = {
				id: 123,
				title: 'Test Movie',
				poster_path: '/path.jpg',
				overview: 'Test overview',
				status: 'Released',
			};

			(WatchlistEntry.findAll as jest.Mock).mockResolvedValue(mockEntries);
			(getMovieDetails as jest.Mock).mockResolvedValue(mockDetails);

			const watchlist = await getWatchlistService(mockAuthUser);

			// Expect results to contain all fields from the mock details
			expect(watchlist).toHaveLength(1);
			expect(watchlist[0]).toMatchObject({
				entry_id: 'entry-1',
				tmdb_id: 123,
				media_type: 'movie',
				status: 'to_watch',
				title: 'Test Movie',
				poster_path: '/path.jpg',
				overview: 'Test overview',
				tmdb_status: 'Released',
				id: 123, // This is coming from the original TMDb details
			});

			expect(WatchlistEntry.findAll).toHaveBeenCalledWith({
				where: { user_id: 'user-1' },
				order: [['created_at', 'DESC']],
			});
		});

		it('should return enriched watchlist entries for TV shows', async () => {
			const mockEntries = [
				{
					entry_id: 'entry-2',
					tmdb_id: 456,
					media_type: 'tv',
					status: 'watching',
					toJSON: () => ({
						entry_id: 'entry-2',
						tmdb_id: 456,
						media_type: 'tv',
						status: 'watching',
					}),
				},
			];
			const mockDetails = {
				id: 456,
				name: 'Test TV Show',
				poster_path: '/tv-path.jpg',
				overview: 'TV overview',
				status: 'Returning Series',
			};

			(WatchlistEntry.findAll as jest.Mock).mockResolvedValue(mockEntries);
			(getTVDetails as jest.Mock).mockResolvedValue(mockDetails);

			const watchlist = await getWatchlistService(mockAuthUser);

			// Expect results to contain all fields from the mock details
			expect(watchlist).toHaveLength(1);
			expect(watchlist[0]).toMatchObject({
				entry_id: 'entry-2',
				tmdb_id: 456,
				media_type: 'tv',
				status: 'watching',
				title: 'Test TV Show',
				poster_path: '/tv-path.jpg',
				overview: 'TV overview',
				tmdb_status: 'Returning Series',
				id: 456, // This is coming from the original TMDb details
				name: 'Test TV Show', // This is coming from the original TMDb details
			});
		});
	});

	describe('updateWatchlistEntryService', () => {
		it('should update a watchlist entry and return enriched data for a movie', async () => {
			const mockEntry = {
				entry_id: 'entry-1',
				user_id: 'user-1',
				tmdb_id: 123,
				media_type: 'movie',
				status: 'finished',
				toJSON: () => ({
					entry_id: 'entry-1',
					user_id: 'user-1',
					tmdb_id: 123,
					media_type: 'movie',
					status: 'finished',
				}),
			};

			const mockDetails = {
				id: 123,
				title: 'Test Movie',
				poster_path: '/path.jpg',
				overview: 'Test overview',
				status: 'Released',
			};

			(WatchlistEntry.update as jest.Mock).mockResolvedValue([1]);
			(WatchlistEntry.findByPk as jest.Mock).mockResolvedValue(mockEntry);
			(getMovieDetails as jest.Mock).mockResolvedValue(mockDetails);

			const updatedEntry = await updateWatchlistEntryService(
				'entry-1',
				{ status: 'finished' },
				mockAuthUser
			);

			// Expect results to contain all fields from the mock details
			expect(updatedEntry).toMatchObject({
				entry_id: 'entry-1',
				user_id: 'user-1',
				tmdb_id: 123,
				media_type: 'movie',
				status: 'finished',
				title: 'Test Movie',
				poster_path: '/path.jpg',
				overview: 'Test overview',
				tmdb_status: 'Released',
				id: 123, // This is coming from the original TMDb details
			});

			expect(WatchlistEntry.update).toHaveBeenCalledWith(
				{ status: 'finished' },
				{ where: { entry_id: 'entry-1', user_id: 'user-1' } }
			);
		});

		it('should update a watchlist entry and return enriched data for a TV show', async () => {
			const mockEntry = {
				entry_id: 'entry-2',
				user_id: 'user-1',
				tmdb_id: 456,
				media_type: 'tv',
				status: 'finished',
				toJSON: () => ({
					entry_id: 'entry-2',
					user_id: 'user-1',
					tmdb_id: 456,
					media_type: 'tv',
					status: 'finished',
				}),
			};

			const mockDetails = {
				id: 456,
				name: 'Test TV Show',
				poster_path: '/tv-path.jpg',
				overview: 'TV overview',
				status: 'Ended',
			};

			(WatchlistEntry.update as jest.Mock).mockResolvedValue([1]);
			(WatchlistEntry.findByPk as jest.Mock).mockResolvedValue(mockEntry);
			(getTVDetails as jest.Mock).mockResolvedValue(mockDetails);

			const updatedEntry = await updateWatchlistEntryService(
				'entry-2',
				{ status: 'finished' },
				mockAuthUser
			);

			// Expect results to contain all fields from the mock details
			expect(updatedEntry).toMatchObject({
				entry_id: 'entry-2',
				user_id: 'user-1',
				tmdb_id: 456,
				media_type: 'tv',
				status: 'finished',
				title: 'Test TV Show',
				poster_path: '/tv-path.jpg',
				overview: 'TV overview',
				tmdb_status: 'Ended',
				id: 456, // This is coming from the original TMDb details
				name: 'Test TV Show', // This is coming from the original TMDb details
			});
		});

		it('should throw an error if entry not found during update', async () => {
			(WatchlistEntry.update as jest.Mock).mockResolvedValue([0]);

			await expect(
				updateWatchlistEntryService(
					'entry-1',
					{ status: 'finished' },
					mockAuthUser
				)
			).rejects.toThrow('Entry not found');
		});

		it('should throw an error if entry not found after update', async () => {
			(WatchlistEntry.update as jest.Mock).mockResolvedValue([1]);
			(WatchlistEntry.findByPk as jest.Mock).mockResolvedValue(null);

			await expect(
				updateWatchlistEntryService(
					'entry-1',
					{ status: 'finished' },
					mockAuthUser
				)
			).rejects.toThrow('Entry not found after update');
		});
	});

	describe('getMatchesService', () => {
		it('should return content matches between users', async () => {
			// Mock accepted matches
			const mockMatches = [
				{
					match_id: 'match-1',
					user1_id: 'user-1',
					user2_id: 'user-2',
					status: 'accepted',
				},
			];

			// Mock user entries
			const mockUserEntries = [
				{
					tmdb_id: 123,
					media_type: 'movie',
					status: 'watch_together_focused',
				},
				{
					tmdb_id: 456,
					media_type: 'tv',
					status: 'watching',
				},
			];

			// Mock matched user entries
			const mockMatchedEntries = [
				{
					tmdb_id: 123,
					media_type: 'movie',
					status: 'watching',
				},
			];

			// Mock movie details
			const mockMovieDetails = {
				id: 123,
				title: 'Test Movie',
				poster_path: '/movie-path.jpg',
				overview: 'Movie overview',
			};

			(Match.findAll as jest.Mock).mockResolvedValue(mockMatches);
			(WatchlistEntry.findAll as jest.Mock).mockImplementation(
				(options: { where: { user_id: string } }) => {
					if (options.where.user_id === 'user-1') {
						return Promise.resolve(mockUserEntries);
					}
					return Promise.resolve(mockMatchedEntries);
				}
			);
			(getMovieDetails as jest.Mock).mockResolvedValue(mockMovieDetails);

			const matches = await getMatchesService(mockAuthUser);

			expect(matches).toHaveLength(1);
			expect(matches[0]).toMatchObject({
				tmdb_id: 123,
				media_type: 'movie',
				title: 'Test Movie',
				poster_path: '/movie-path.jpg',
				overview: 'Movie overview',
				user1_status: 'watch_together_focused',
				user2_status: 'watching',
			});

			expect(Match.findAll).toHaveBeenCalled();
			expect(WatchlistEntry.findAll).toHaveBeenCalledTimes(2);
		});

		it('should return an empty array if no matches found', async () => {
			(Match.findAll as jest.Mock).mockResolvedValue([]);

			const matches = await getMatchesService(mockAuthUser);

			expect(matches).toEqual([]);
		});

		it('should handle API errors when fetching details', async () => {
			// Mock accepted matches
			const mockMatches = [
				{
					match_id: 'match-1',
					user1_id: 'user-1',
					user2_id: 'user-2',
					status: 'accepted',
				},
			];

			// Mock user entries
			const mockUserEntries = [
				{
					tmdb_id: 123,
					media_type: 'movie',
					status: 'watch_together_focused',
				},
			];

			// Mock matched user entries
			const mockMatchedEntries = [
				{
					tmdb_id: 123,
					media_type: 'movie',
					status: 'watching',
				},
			];

			(Match.findAll as jest.Mock).mockResolvedValue(mockMatches);
			(WatchlistEntry.findAll as jest.Mock).mockImplementation(
				(options: { where: { user_id: string } }) => {
					if (options.where.user_id === 'user-1') {
						return Promise.resolve(mockUserEntries);
					}
					return Promise.resolve(mockMatchedEntries);
				}
			);

			// Mock API error
			(getMovieDetails as jest.Mock).mockRejectedValue(new Error('API Error'));

			const matches = await getMatchesService(mockAuthUser);

			// Should return empty array as the content match is filtered out due to API error
			expect(matches).toEqual([]);
		});
	});
});
