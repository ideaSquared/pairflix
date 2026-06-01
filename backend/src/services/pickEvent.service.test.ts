jest.mock('../models/PickEvent', () => ({
	__esModule: true,
	default: {
		create: jest.fn(),
		findAll: jest.fn(),
	},
}));

import PickEvent from '../models/PickEvent';
import { getPickEventStats, recordPickEvent } from './pickEvent.service';

const mockedCreate = PickEvent.create as jest.MockedFunction<
	typeof PickEvent.create
>;
const mockedFindAll = PickEvent.findAll as jest.MockedFunction<
	typeof PickEvent.findAll
>;

describe('pickEvent.service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('recordPickEvent', () => {
		it('passes through all fields and nulls optionals when omitted', async () => {
			mockedCreate.mockResolvedValueOnce({ id: 'evt-1' } as never);

			await recordPickEvent({
				household_id: 'h1',
				tmdb_id: 42,
				media_type: 'movie',
				kind: 'proposed',
			});

			expect(mockedCreate).toHaveBeenCalledWith({
				household_id: 'h1',
				user_id: null,
				tmdb_id: 42,
				media_type: 'movie',
				kind: 'proposed',
				mood: null,
				minutes_budget: null,
				provider_slug: null,
				region: null,
			});
		});

		it('persists provided optional fields', async () => {
			mockedCreate.mockResolvedValueOnce({ id: 'evt-2' } as never);

			await recordPickEvent({
				household_id: 'h1',
				user_id: 'u1',
				tmdb_id: 7,
				media_type: 'tv',
				kind: 'provider_launched',
				mood: 'funny',
				minutes_budget: 90,
				provider_slug: 'netflix',
				region: 'GB',
			});

			expect(mockedCreate).toHaveBeenCalledWith({
				household_id: 'h1',
				user_id: 'u1',
				tmdb_id: 7,
				media_type: 'tv',
				kind: 'provider_launched',
				mood: 'funny',
				minutes_budget: 90,
				provider_slug: 'netflix',
				region: 'GB',
			});
		});
	});

	describe('getPickEventStats', () => {
		const makeEvent = (
			kind: string,
			provider_slug: string | null = null
		): { kind: string; provider_slug: string | null } => ({
			kind,
			provider_slug,
		});

		it('aggregates totals and first-pick acceptance rate', async () => {
			mockedFindAll.mockResolvedValueOnce([
				makeEvent('proposed'),
				makeEvent('accepted'),
				makeEvent('proposed'),
				makeEvent('accepted'),
				makeEvent('proposed'),
				makeEvent('swapped'),
				makeEvent('provider_launched', 'netflix'),
				makeEvent('provider_launched', 'netflix'),
				makeEvent('provider_launched', 'prime'),
			] as never);

			const stats = await getPickEventStats('h1');

			expect(stats.window_days).toBe(30);
			expect(stats.totals.proposed).toBe(3);
			expect(stats.totals.accepted).toBe(2);
			expect(stats.totals.swapped).toBe(1);
			expect(stats.totals.dismissed).toBe(0);
			expect(stats.totals.provider_launched).toBe(3);
			expect(stats.first_pick_acceptance_rate).toBeCloseTo(2 / 3);
			expect(stats.provider_clicks_by_slug).toEqual({
				netflix: 2,
				prime: 1,
			});
		});

		it('returns null acceptance rate when there are no responses', async () => {
			mockedFindAll.mockResolvedValueOnce([makeEvent('proposed')] as never);

			const stats = await getPickEventStats('h1');
			expect(stats.totals.proposed).toBe(1);
			expect(stats.first_pick_acceptance_rate).toBeNull();
		});

		it('passes window_days through to the query bound', async () => {
			mockedFindAll.mockResolvedValueOnce([] as never);
			await getPickEventStats('h1', 7);

			const call = mockedFindAll.mock.calls[0]?.[0] as
				| { where?: { occurred_at?: Record<string, Date> } }
				| undefined;
			const bound = call?.where?.occurred_at?.gte;
			expect(bound).toBeInstanceOf(Date);
			const ageMs = Date.now() - (bound as Date).getTime();
			const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
			expect(Math.abs(ageMs - sevenDaysMs)).toBeLessThan(5000);
		});

		it('ignores provider_launched without provider_slug', async () => {
			mockedFindAll.mockResolvedValueOnce([
				makeEvent('provider_launched', null),
				makeEvent('provider_launched', 'netflix'),
			] as never);

			const stats = await getPickEventStats('h1');
			expect(stats.totals.provider_launched).toBe(2);
			expect(stats.provider_clicks_by_slug).toEqual({ netflix: 1 });
		});
	});
});
