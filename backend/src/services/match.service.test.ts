import Match from '../models/Match';
import {
	createMatchService,
	getMatchesService,
	updateMatchStatusService,
} from './match.service';

jest.mock('../models/Match');
jest.mock('../models/User');

describe('Match Service', () => {
	describe('createMatchService', () => {
		it('should create a match successfully', async () => {
			(Match.findOne as jest.Mock).mockResolvedValue(null);
			(Match.create as jest.Mock).mockResolvedValue({ match_id: 'match-1' });

			const match = await createMatchService(
				{ user_id: 'user-1' },
				{ user2_id: 'user-2' }
			);
			expect(match).toEqual({ match_id: 'match-1' });
		});

		it('should throw an error if match already exists', async () => {
			(Match.findOne as jest.Mock).mockResolvedValue({ match_id: 'match-1' });

			await expect(
				createMatchService({ user_id: 'user-1' }, { user2_id: 'user-2' })
			).rejects.toThrow('Match already exists');
		});
	});

	describe('getMatchesService', () => {
		it('should return matches for a user', async () => {
			(Match.findAll as jest.Mock).mockResolvedValue([{ match_id: 'match-1' }]);

			const matches = await getMatchesService({ user_id: 'user-1' });
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
			(Match.findByPk as jest.Mock).mockResolvedValue(mockMatch);

			const updatedMatch = await updateMatchStatusService(
				'match-1',
				'accepted',
				{ user_id: 'user-1' }
			);
			expect(mockMatch.save).toHaveBeenCalled();
			expect(updatedMatch).toEqual(mockMatch);
		});

		it('should throw an error if match not found', async () => {
			(Match.findByPk as jest.Mock).mockResolvedValue(null);

			await expect(
				updateMatchStatusService('match-1', 'accepted', { user_id: 'user-1' })
			).rejects.toThrow('Match not found');
		});
	});
});
