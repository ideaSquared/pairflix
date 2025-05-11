import * as matchService from '../services/match.service';
import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import { createMatch, getMatches, updateMatchStatus } from './match.controller';

// Mock the match service
jest.mock('../services/match.service', () => ({
	createMatchService: jest.fn(),
	getMatchesService: jest.fn(),
	updateMatchStatusService: jest.fn(),
}));

describe('Match Controller', () => {
	beforeEach(() => {
		resetMocks();
	});

	describe('createMatch', () => {
		it('should create a match successfully', async () => {
			// Arrange
			const req = mockRequest({
				body: { user2_id: 'target-user-id' },
			});
			const res = mockResponse();

			const mockMatch = {
				match_id: 'new-match-id',
				user1_id: 'test-user-id',
				user2_id: 'target-user-id',
				status: 'pending',
				created_at: new Date(),
				updated_at: new Date(),
			};

			(matchService.createMatchService as jest.Mock).mockResolvedValue(
				mockMatch
			);

			// Act
			await createMatch(req, res);

			// Assert
			expect(matchService.createMatchService).toHaveBeenCalledWith(req.user, {
				user2_id: 'target-user-id',
			});
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(mockMatch);
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest({
				body: { user2_id: 'target-user-id' },
			});
			const res = mockResponse();

			const errorMessage = 'Match already exists';
			(matchService.createMatchService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await createMatch(req, res);

			// Assert
			expect(matchService.createMatchService).toHaveBeenCalledWith(req.user, {
				user2_id: 'target-user-id',
			});
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should handle unknown errors', async () => {
			// Arrange
			const req = mockRequest({
				body: { user2_id: 'target-user-id' },
			});
			const res = mockResponse();

			(matchService.createMatchService as jest.Mock).mockRejectedValue(
				'Unknown error'
			);

			// Act
			await createMatch(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});

	describe('getMatches', () => {
		it('should return matches for the user', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			const mockMatches = [
				{
					match_id: 'match-1',
					user1_id: 'test-user-id',
					user2_id: 'other-user-id',
					status: 'pending',
				},
				{
					match_id: 'match-2',
					user1_id: 'other-user-id',
					user2_id: 'test-user-id',
					status: 'accepted',
				},
			];

			(matchService.getMatchesService as jest.Mock).mockResolvedValue(
				mockMatches
			);

			// Act
			await getMatches(req, res);

			// Assert
			expect(matchService.getMatchesService).toHaveBeenCalledWith(req.user);
			expect(res.json).toHaveBeenCalledWith(mockMatches);
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			const errorMessage = 'Database error';
			(matchService.getMatchesService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await getMatches(req, res);

			// Assert
			expect(matchService.getMatchesService).toHaveBeenCalledWith(req.user);
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
		});

		it('should handle unknown errors', async () => {
			// Arrange
			const req = mockRequest();
			const res = mockResponse();

			(matchService.getMatchesService as jest.Mock).mockRejectedValue(
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

	describe('updateMatchStatus', () => {
		it('should update match status successfully', async () => {
			// Arrange
			const req = mockRequest({
				params: { match_id: 'match-1' },
				body: { status: 'accepted' },
			});
			const res = mockResponse();

			const mockUpdatedMatch = {
				match_id: 'match-1',
				user1_id: 'other-user-id',
				user2_id: 'test-user-id',
				status: 'accepted',
				updated_at: new Date(),
			};

			(matchService.updateMatchStatusService as jest.Mock).mockResolvedValue(
				mockUpdatedMatch
			);

			// Act
			await updateMatchStatus(req, res);

			// Assert
			expect(matchService.updateMatchStatusService).toHaveBeenCalledWith(
				'match-1',
				'accepted',
				req.user
			);
			expect(res.json).toHaveBeenCalledWith(mockUpdatedMatch);
		});

		it('should handle service errors', async () => {
			// Arrange
			const req = mockRequest({
				params: { match_id: 'match-1' },
				body: { status: 'accepted' },
			});
			const res = mockResponse();

			const errorMessage = 'Match not found';
			(matchService.updateMatchStatusService as jest.Mock).mockRejectedValue(
				new Error(errorMessage)
			);

			// Act
			await updateMatchStatus(req, res);

			// Assert
			expect(matchService.updateMatchStatusService).toHaveBeenCalledWith(
				'match-1',
				'accepted',
				req.user
			);
			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
		});

		it('should handle unknown errors', async () => {
			// Arrange
			const req = mockRequest({
				params: { match_id: 'match-1' },
				body: { status: 'accepted' },
			});
			const res = mockResponse();

			(matchService.updateMatchStatusService as jest.Mock).mockRejectedValue(
				'Unknown error'
			);

			// Act
			await updateMatchStatus(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Unknown error occurred',
			});
		});
	});
});
