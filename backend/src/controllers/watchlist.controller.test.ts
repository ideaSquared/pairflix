import * as watchlistService from '../services/watchlist.service';
import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import {
	addToWatchlist,
	getMatches,
	getWatchlist,
	updateWatchlistEntry,
} from './watchlist.controller';

// Mock the watchlist service
jest.mock('../services/watchlist.service', () => ({
	addToWatchlistService: jest.fn(),
	getWatchlistService: jest.fn(),
	updateWatchlistEntryService: jest.fn(),
	getMatchesService: jest.fn(),
}));

describe('Watchlist Controller', () => {
	beforeEach(() => {
		resetMocks();
	});

	describe('addToWatchlist', () => {
		it('should add an entry to watchlist successfully', async () => {
			// Arrange
			const watchlistEntry = {
				tmdb_id: 123,
				media_type: 'movie',
				status: 'to_watch',
				notes: 'Want to watch this weekend',
			};

			const req = mockRequest({
				body: watchlistEntry,
			});
			const res = mockResponse();

			const mockCreatedEntry = {
				entry_id: 'new-entry-id',
				user_id: 'test-user-id',
				...watchlistEntry,
				created_at: new Date(),
				updated_at: new Date(),
			};

			(watchlistService.addToWatchlistService as jest.Mock).mockResolvedValue(
				mockCreatedEntry
			);

			// Act
			await addToWatchlist(req, res);

			// Assert
			expect(watchlistService.addToWatchlistService).toHaveBeenCalledWith(
				req.user,
				watchlistEntry
			);
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(mockCreatedEntry);
		});

		it('should handle validation errors', async () => {
			// Arrange
			const req = mockRequest({
				body: { tmdb_id: 123 }, // Missing required fields
			});
			const res = mockResponse();

			const errorMessage = 'Missing required fields';
			(watchlistService.addToWatchlistService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await addToWatchlist(req, res);

			// Assert
			expect(watchlistService.addToWatchlistService).toHaveBeenCalledWith(
				req.user,
				{ tmdb_id: 123 }
			);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should handle unknown errors', async () => {
			// Arrange
			const req = mockRequest({
				body: {
					tmdb_id: 123,
					media_type: 'movie',
					status: 'to_watch',
				},
			});
			const res = mockResponse();

			(watchlistService.addToWatchlistService as jest.Mock).mockRejectedValue(
				'Unknown error'
			);

			// Act
			await addToWatchlist(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});

	describe('getWatchlist', () => {
		it('should return user watchlist successfully', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			const mockWatchlist = [
				{
					entry_id: 'entry-1',
					user_id: 'test-user-id',
					tmdb_id: 123,
					media_type: 'movie',
					status: 'to_watch',
					title: 'Test Movie',
					poster_path: '/path/to/poster.jpg',
					overview: 'Movie description',
				},
				{
					entry_id: 'entry-2',
					user_id: 'test-user-id',
					tmdb_id: 456,
					media_type: 'tv',
					status: 'watching',
					title: 'Test TV Show',
					poster_path: '/path/to/tv-poster.jpg',
					overview: 'TV show description',
				},
			];

			(watchlistService.getWatchlistService as jest.Mock).mockResolvedValue(
				mockWatchlist
			);

			// Act
			await getWatchlist(req, res);

			// Assert
			expect(watchlistService.getWatchlistService).toHaveBeenCalledWith(
				req.user
			);
			expect(res.json).toHaveBeenCalledWith(mockWatchlist);
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			const errorMessage = 'Database error';
			(watchlistService.getWatchlistService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await getWatchlist(req, res);

			// Assert
			expect(watchlistService.getWatchlistService).toHaveBeenCalledWith(
				req.user
			);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should handle unknown errors', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			(watchlistService.getWatchlistService as jest.Mock).mockRejectedValue(
				'Unknown error'
			);

			// Act
			await getWatchlist(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});

	describe('updateWatchlistEntry', () => {
		it('should update a watchlist entry successfully', async () => {
			// Arrange
			const entryId = 'entry-1';
			const updates = {
				status: 'finished',
				rating: 5,
				notes: 'Loved it!',
			};

			const req = mockRequest({
				params: { entry_id: entryId },
				body: updates,
			});
			const res = mockResponse();

			const mockUpdatedEntry = {
				entry_id: entryId,
				user_id: 'test-user-id',
				tmdb_id: 123,
				media_type: 'movie',
				status: 'finished',
				rating: 5,
				notes: 'Loved it!',
				title: 'Test Movie',
				poster_path: '/path/to/poster.jpg',
				overview: 'Movie description',
				updated_at: new Date(),
			};

			(
				watchlistService.updateWatchlistEntryService as jest.Mock
			).mockResolvedValue(mockUpdatedEntry);

			// Act
			await updateWatchlistEntry(req, res);

			// Assert
			expect(watchlistService.updateWatchlistEntryService).toHaveBeenCalledWith(
				entryId,
				updates,
				req.user
			);
			expect(res.json).toHaveBeenCalledWith(mockUpdatedEntry);
		});

		it('should handle entry not found error', async () => {
			// Arrange
			const entryId = 'non-existent-id';
			const updates = { status: 'finished' };

			const req = mockRequest({
				params: { entry_id: entryId },
				body: updates,
			});
			const res = mockResponse();

			const errorMessage = 'Entry not found';
			(
				watchlistService.updateWatchlistEntryService as jest.Mock
			).mockRejectedValue(new Error(errorMessage));

			// Act
			await updateWatchlistEntry(req, res);

			// Assert
			expect(watchlistService.updateWatchlistEntryService).toHaveBeenCalledWith(
				entryId,
				updates,
				req.user
			);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should handle unknown errors', async () => {
			// Arrange
			const entryId = 'entry-1';
			const updates = { status: 'finished' };

			const req = mockRequest({
				params: { entry_id: entryId },
				body: updates,
			});
			const res = mockResponse();

			(
				watchlistService.updateWatchlistEntryService as jest.Mock
			).mockRejectedValue('Unknown error');

			// Act
			await updateWatchlistEntry(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});

	describe('getMatches', () => {
		it('should return content matches successfully', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			const mockContentMatches = [
				{
					tmdb_id: 123,
					media_type: 'movie',
					title: 'Test Movie',
					poster_path: '/path/to/poster.jpg',
					overview: 'Movie description',
					user1_status: 'to_watch_together',
					user2_status: 'watching',
				},
				{
					tmdb_id: 456,
					media_type: 'tv',
					title: 'Test TV Show',
					poster_path: '/path/to/tv-poster.jpg',
					overview: 'TV show description',
					user1_status: 'finished',
					user2_status: 'watching',
				},
			];

			(watchlistService.getMatchesService as jest.Mock).mockResolvedValue(
				mockContentMatches
			);

			// Act
			await getMatches(req, res);

			// Assert
			expect(watchlistService.getMatchesService).toHaveBeenCalledWith(req.user);
			expect(res.json).toHaveBeenCalledWith(mockContentMatches);
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			const errorMessage = 'Failed to retrieve matches';
			(watchlistService.getMatchesService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await getMatches(req, res);

			// Assert
			expect(watchlistService.getMatchesService).toHaveBeenCalledWith(req.user);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should handle unknown errors', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			(watchlistService.getMatchesService as jest.Mock).mockRejectedValue(
				'Unknown error'
			);

			// Act
			await getMatches(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});
});
