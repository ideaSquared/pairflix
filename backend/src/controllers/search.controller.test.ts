import * as searchService from '../services/search.service';
import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import { searchTMDb } from './search.controller';

// Mock the search service
jest.mock('../services/search.service', () => ({
	searchMediaService: jest.fn(),
}));

// Mock the activity service
jest.mock('../services/activity.service', () => ({
	activityService: {
		logActivity: jest.fn().mockResolvedValue({}),
	},
}));

describe('Search Controller', () => {
	beforeEach(() => {
		resetMocks();
	});

	describe('searchTMDb', () => {
		it('should return search results when query is valid', async () => {
			// Arrange
			const mockQuery = 'test movie';
			const req = mockRequest({
				query: { query: mockQuery },
			});
			const res = mockResponse();

			const mockResults = {
				results: [
					{ id: 123, title: 'Test Movie', media_type: 'movie' },
					{ id: 456, name: 'Test TV Show', media_type: 'tv' },
				],
			};

			// Mock the search service to return results
			(searchService.searchMediaService as jest.Mock).mockResolvedValue(
				mockResults
			);

			// Act
			await searchTMDb(req, res);

			// Assert
			expect(searchService.searchMediaService).toHaveBeenCalledWith(mockQuery);
			expect(res.json).toHaveBeenCalledWith(mockResults);
		});

		it('should return 400 when query parameter is missing', async () => {
			// Arrange
			const req = mockRequest({
				query: {}, // No query parameter
			});
			const res = mockResponse();

			// Act
			await searchTMDb(req, res);

			// Assert
			expect(searchService.searchMediaService).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Query parameter is required',
			});
		});

		it('should return 400 when query parameter is not a string', async () => {
			// Arrange
			const req = mockRequest({
				query: { query: ['invalid', 'array'] }, // Invalid query type
			});
			const res = mockResponse();

			// Act
			await searchTMDb(req, res);

			// Assert
			expect(searchService.searchMediaService).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Query parameter is required',
			});
		});

		it('should return 500 when search service throws an error', async () => {
			// Arrange
			const req = mockRequest({
				query: { query: 'test movie' },
			});
			const res = mockResponse();

			const errorMessage = 'TMDb API error';
			(searchService.searchMediaService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await searchTMDb(req, res);

			// Assert
			expect(searchService.searchMediaService).toHaveBeenCalledWith(
				'test movie'
			);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should handle unknown errors from the search service', async () => {
			// Arrange
			const req = mockRequest({
				query: { query: 'test movie' },
			});
			const res = mockResponse();

			// Mock a non-Error rejection
			(searchService.searchMediaService as jest.Mock).mockRejectedValue(
				'Unknown error'
			);

			// Act
			await searchTMDb(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});
});
