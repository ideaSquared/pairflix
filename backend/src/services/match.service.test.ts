import Match from '../models/Match';
import type { AuthenticatedUser } from '../types';
import {
	createMatchService,
	getMatchesService,
	updateMatchStatusService,
} from './match.service';

// Mock the Match model
jest.mock('../models/Match', () => ({
	__esModule: true,
	default: {
		findOne: jest.fn(),
		create: jest.fn(),
		findAll: jest.fn(),
		findByPk: jest.fn(),
	},
}));

jest.mock('../models/User');

// Create mock authenticated user
const mockUser1: AuthenticatedUser = {
	user_id: 'user-1',
	email: 'user1@example.com',
	username: 'user1',
	role: 'user',
	status: 'active',
	preferences: {
		theme: 'dark',
		viewStyle: 'grid',
		emailNotifications: true,
		autoArchiveDays: 30,
		favoriteGenres: [],
	},
};

// Cast Match to the mocked version for easier access to mock methods
const MockedMatch = Match as jest.Mocked<typeof Match>;

describe('Match Service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('createMatchService', () => {
		it('should create a match successfully', async () => {
			MockedMatch.findOne.mockResolvedValue(null);
			MockedMatch.create.mockResolvedValue({ match_id: 'match-1' } as any);

			const match = await createMatchService(mockUser1, { user2_id: 'user-2' });
			expect(match).toEqual({ match_id: 'match-1' });
		});

		it('should throw an error if match already exists', async () => {
			MockedMatch.findOne.mockResolvedValue({ match_id: 'match-1' } as any);

			await expect(
				createMatchService(mockUser1, { user2_id: 'user-2' })
			).rejects.toThrow('Match already exists');
		});
	});

	describe('getMatchesService', () => {
		it('should return matches for a user', async () => {
			MockedMatch.findAll.mockResolvedValue([{ match_id: 'match-1' }] as any);

			const matches = await getMatchesService(mockUser1);
			expect(matches).toEqual([{ match_id: 'match-1' }]);
		});
	});

	describe('updateMatchStatusService', () => {
		it('should update match status successfully', async () => {
			const mockMatch = {
				save: jest.fn(),
				user1_id: 'user-1',
				user2_id: 'user-2',
			};
			MockedMatch.findByPk.mockResolvedValue(mockMatch as any);

			const updatedMatch = await updateMatchStatusService(
				'match-1',
				'accepted',
				mockUser1
			);
			expect(mockMatch.save).toHaveBeenCalled();
			expect(updatedMatch).toEqual(mockMatch);
		});

		it('should throw an error if match not found', async () => {
			MockedMatch.findByPk.mockResolvedValue(null);

			await expect(
				updateMatchStatusService('match-1', 'accepted', mockUser1)
			).rejects.toThrow('Match not found');
		});
	});
});
