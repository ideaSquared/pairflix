import {
	mockRequest,
	mockResponse,
	resetMocks,
} from '../tests/controller-helpers';
import { createMatch, getMatches, updateMatchStatus } from './match.controller';

// Mock the models used by the match service
jest.mock('../models/Match', () => ({
	__esModule: true,
	default: {
		findOne: jest.fn(),
		findAll: jest.fn(),
		findByPk: jest.fn(),
		create: jest.fn(),
	},
}));

jest.mock('../models/User', () => ({
	__esModule: true,
	default: {
		findByPk: jest.fn(),
		findOne: jest.fn(),
	},
}));

jest.mock('../models/WatchlistEntry', () => ({
	__esModule: true,
	default: {
		findAll: jest.fn(),
	},
}));

// Mock the match service
jest.mock('../services/match.service', () => ({
	createMatchService: jest.fn(),
	getMatchesService: jest.fn(),
	updateMatchStatusService: jest.fn(),
}));

import * as matchService from '../services/match.service';

// Mock the audit service
jest.mock('../services/audit.service', () => ({
	auditLogService: {
		info: jest.fn().mockResolvedValue({}),
		error: jest.fn().mockResolvedValue({}),
	},
}));

// Mock the activity service
jest.mock('../services/activity.service', () => ({
	activityService: {
		logActivity: jest.fn().mockResolvedValue({}),
	},
	ActivityType: {
		MATCH_CREATE: 'MATCH_CREATE',
		MATCH_UPDATE: 'MATCH_UPDATE',
		MATCH_ACCEPTED: 'MATCH_ACCEPTED',
		MATCH_DECLINED: 'MATCH_DECLINED',
	},
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

			// Mock Match model methods
			(Match.findOne as jest.Mock).mockResolvedValue(null); // No existing match
			(Match.create as jest.Mock).mockResolvedValue(mockMatch);

			// Act
			await createMatch(req, res);

			// Assert
			expect(Match.findOne).toHaveBeenCalledWith({
				where: {
					user1_id: 'test-user-id',
					user2_id: 'target-user-id',
				},
			});
			expect(Match.create).toHaveBeenCalledWith({
				user1_id: 'test-user-id',
				user2_id: 'target-user-id',
				status: 'pending',
			});
			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith(mockMatch);
		});

		it('should handle existing match', async () => {
			// Arrange
			const req = mockRequest({
				body: { user2_id: 'target-user-id' },
			});
			const res = mockResponse();

			const existingMatch = {
				match_id: 'existing-match-id',
				user1_id: 'test-user-id',
				user2_id: 'target-user-id',
				status: 'pending',
			};

			// Mock Match model methods
			(Match.findOne as jest.Mock).mockResolvedValue(existingMatch); // Return existing match

			// Act
			await createMatch(req, res);

			// Assert
			expect(Match.findOne).toHaveBeenCalledWith({
				where: {
					user1_id: 'test-user-id',
					user2_id: 'target-user-id',
				},
			});
			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Match already exists',
				match: existingMatch,
			});
		});

		it('should handle database errors', async () => {
			// Arrange
			const req = mockRequest({
				body: { user2_id: 'target-user-id' },
			});
			const res = mockResponse();

			// Mock Match model methods
			(Match.findOne as jest.Mock).mockResolvedValue(null);
			(Match.create as jest.Mock).mockRejectedValue(
				new Error('Database error')
			);

			// Act
			await createMatch(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Database error',
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

			const mockMatch = {
				match_id: 'match-1',
				user1_id: 'other-user-id',
				user2_id: 'test-user-id',
				status: 'pending',
				save: jest.fn().mockResolvedValue(true),
			};

			// Mock Match model methods
			(Match.findByPk as jest.Mock).mockResolvedValue(mockMatch);

			// Act
			await updateMatchStatus(req, res);

			// Assert
			expect(Match.findByPk).toHaveBeenCalledWith('match-1');
			expect(mockMatch.save).toHaveBeenCalled();
			expect(mockMatch.status).toBe('accepted');
			expect(res.json).toHaveBeenCalledWith(mockMatch);
		});

		it('should handle match not found', async () => {
			// Arrange
			const req = mockRequest({
				params: { match_id: 'match-1' },
				body: { status: 'accepted' },
			});
			const res = mockResponse();

			// Mock Match model methods
			(Match.findByPk as jest.Mock).mockResolvedValue(null);

			// Act
			await updateMatchStatus(req, res);

			// Assert
			expect(Match.findByPk).toHaveBeenCalledWith('match-1');
			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: 'Match not found' });
		});

		it('should handle unauthorized user', async () => {
			// Arrange
			const req = mockRequest({
				params: { match_id: 'match-1' },
				body: { status: 'accepted' },
			});
			const res = mockResponse();

			const mockMatch = {
				match_id: 'match-1',
				user1_id: 'other-user-id',
				user2_id: 'another-user-id', // Different from test-user-id
				status: 'pending',
			};

			// Mock Match model methods
			(Match.findByPk as jest.Mock).mockResolvedValue(mockMatch);

			// Act
			await updateMatchStatus(req, res);

			// Assert
			expect(Match.findByPk).toHaveBeenCalledWith('match-1');
			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				error: 'Only the recipient can accept/reject a match request',
			});
		});
	});
});
