import {
	__clearCandidateCacheForTests,
	RecommendationService,
} from './recommendation.service';
import type {
	HouseholdRepository,
	HouseholdStub,
	TasteProfileStub,
	WatchedTogetherStub,
} from './recommendation.types';

jest.mock('./tmdb.service', () => ({
	discoverMedia: jest.fn(),
	getMovieFullDetails: jest.fn(),
	getTVFullDetails: jest.fn(),
	getWatchProviders: jest.fn(),
}));

import {
	discoverMedia,
	getMovieFullDetails,
	getWatchProviders,
} from './tmdb.service';

const mockedDiscover = discoverMedia as jest.MockedFunction<
	typeof discoverMedia
>;
const mockedGetMovieFull = getMovieFullDetails as jest.MockedFunction<
	typeof getMovieFullDetails
>;
const mockedGetWatchProviders = getWatchProviders as jest.MockedFunction<
	typeof getWatchProviders
>;

const buildRepo = (
	overrides: Partial<HouseholdRepository> = {}
): HouseholdRepository => ({
	getHousehold: jest.fn(async (): Promise<HouseholdStub | null> => ({
		household_id: 'h1',
		member_ids: ['u1', 'u2'],
	})),
	getMemberTasteProfiles: jest.fn(async (): Promise<TasteProfileStub[]> => [
		{ user_id: 'u1', weights: { genres: { 35: 0.8, 18: 0.2 } } },
		{ user_id: 'u2', weights: { genres: { 35: 0.6, 28: 0.4 } } },
	]),
	getWatchedTogether: jest.fn(async (): Promise<WatchedTogetherStub[]> => []),
	getFinishedTmdbIdsForMembers: jest.fn(async () => []),
	recordWatchedTogether: jest.fn(async () => undefined),
	isMember: jest.fn(async () => true),
	...overrides,
});

const candidate = (id: number, overrides: Record<string, unknown> = {}) => ({
	id,
	title: `Movie ${id}`,
	original_title: `Movie ${id}`,
	overview: '',
	poster_path: `/p${id}.jpg`,
	release_date: '2023-01-01',
	vote_average: 7.5,
	vote_count: 1000,
	genre_ids: [35],
	popularity: 50,
	...overrides,
});

beforeEach(() => {
	jest.clearAllMocks();
	__clearCandidateCacheForTests();
	mockedGetMovieFull.mockResolvedValue({
		id: 1,
		title: 'Movie 1',
		overview: '',
		poster_path: null,
		status: 'Released',
		runtime: 95,
	});
});

describe('RecommendationService.pickForHousehold', () => {
	it('returns top pick with alternates from the candidate set', async () => {
		mockedDiscover.mockResolvedValue({
			results: [candidate(1), candidate(2), candidate(3), candidate(4)],
		});

		const svc = new RecommendationService(buildRepo());
		const result = await svc.pickForHousehold({
			householdId: 'h1',
			mood: 'funny',
			minutes: 90,
		});

		expect(result.pick.tmdb_id).toBeGreaterThan(0);
		expect(result.alternates).toHaveLength(2);
		expect(result.rationale.length).toBeGreaterThan(0);
		expect(result.score).toBeGreaterThanOrEqual(0);
		expect(mockedDiscover).toHaveBeenCalledWith(
			expect.objectContaining({
				mediaType: 'movie',
				region: 'GB',
				withRuntimeLte: 90,
			})
		);
	});

	it('throws when the household does not exist', async () => {
		const repo = buildRepo({
			getHousehold: jest.fn(async () => null),
		});
		const svc = new RecommendationService(repo);

		await expect(
			svc.pickForHousehold({
				householdId: 'missing',
				mood: 'funny',
				minutes: 90,
			})
		).rejects.toThrow('Household not found');
	});

	it('excludes titles the household has already watched together', async () => {
		mockedDiscover.mockResolvedValue({
			results: [candidate(101), candidate(102)],
		});

		const repo = buildRepo({
			getWatchedTogether: jest.fn(async () => [
				{
					household_id: 'h1',
					tmdb_id: 101,
					media_type: 'movie' as const,
					watched_at: new Date(),
					enjoyed: true,
				},
			]),
		});
		const svc = new RecommendationService(repo);

		const result = await svc.pickForHousehold({
			householdId: 'h1',
			mood: 'funny',
			minutes: 90,
		});

		expect(result.pick.tmdb_id).toBe(102);
	});

	it('drops candidates that fail the provider filter', async () => {
		mockedDiscover.mockResolvedValue({
			results: [candidate(201), candidate(202), candidate(203)],
		});
		mockedGetWatchProviders.mockImplementation(async tmdbId => {
			if (tmdbId === 201) {
				return {
					flatrate: [
						{
							provider_id: 8,
							provider_name: 'Netflix',
							logo_path: '/n.png',
						},
					],
				};
			}
			return {};
		});

		const svc = new RecommendationService(buildRepo());
		const result = await svc.pickForHousehold({
			householdId: 'h1',
			mood: 'funny',
			minutes: 90,
			providers: ['netflix'],
		});

		expect(result.pick.tmdb_id).toBe(201);
		expect(mockedGetWatchProviders).toHaveBeenCalled();
	});

	it('throws when no candidates remain after filtering', async () => {
		mockedDiscover.mockResolvedValue({ results: [] });

		const svc = new RecommendationService(buildRepo());

		await expect(
			svc.pickForHousehold({
				householdId: 'h1',
				mood: 'funny',
				minutes: 90,
			})
		).rejects.toThrow('No candidates');
	});
});
