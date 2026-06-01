jest.mock('./tmdb.service', () => ({
	fetchWatchProviders: jest.fn(),
}));

import { fetchWatchProviders } from './tmdb.service';
import {
	ProviderNotAvailableError,
	resolveProviderLaunch,
} from './providerLaunch.service';

const mockedFetch = fetchWatchProviders as jest.MockedFunction<
	typeof fetchWatchProviders
>;

describe('providerLaunch.service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('returns the JustWatch link when the provider is available in the region', async () => {
		mockedFetch.mockResolvedValueOnce({
			GB: {
				link: 'https://www.themoviedb.org/movie/42/watch?locale=GB',
				flatrate: [
					{ provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png' },
				],
			},
		});

		const result = await resolveProviderLaunch({
			tmdb_id: 42,
			media_type: 'movie',
			provider_slug: 'netflix',
			region: 'GB',
		});

		expect(result.url).toBe(
			'https://www.themoviedb.org/movie/42/watch?locale=GB'
		);
		expect(result.provider_name).toBe('Netflix');
		expect(result.region).toBe('GB');
	});

	it('normalises slug to match provider names with punctuation', async () => {
		mockedFetch.mockResolvedValueOnce({
			GB: {
				link: 'https://x',
				flatrate: [
					{
						provider_id: 337,
						provider_name: 'Disney Plus',
						logo_path: '/x.png',
					},
				],
			},
		});

		const result = await resolveProviderLaunch({
			tmdb_id: 1,
			media_type: 'movie',
			provider_slug: 'disney_plus',
			region: 'GB',
		});

		expect(result.provider_name).toBe('Disney Plus');
	});

	it('throws when the region has no providers', async () => {
		mockedFetch.mockResolvedValueOnce({});

		await expect(
			resolveProviderLaunch({
				tmdb_id: 1,
				media_type: 'movie',
				provider_slug: 'netflix',
				region: 'GB',
			})
		).rejects.toBeInstanceOf(ProviderNotAvailableError);
	});

	it('throws when the provider is not in the region', async () => {
		mockedFetch.mockResolvedValueOnce({
			GB: {
				link: 'https://x',
				flatrate: [
					{ provider_id: 9, provider_name: 'Prime Video', logo_path: '/x.png' },
				],
			},
		});

		await expect(
			resolveProviderLaunch({
				tmdb_id: 1,
				media_type: 'movie',
				provider_slug: 'netflix',
				region: 'GB',
			})
		).rejects.toBeInstanceOf(ProviderNotAvailableError);
	});

	it('searches across flatrate, rent and buy', async () => {
		mockedFetch.mockResolvedValueOnce({
			GB: {
				link: 'https://x',
				rent: [
					{ provider_id: 100, provider_name: 'Apple TV', logo_path: '/x.png' },
				],
			},
		});

		const result = await resolveProviderLaunch({
			tmdb_id: 1,
			media_type: 'movie',
			provider_slug: 'apple_tv',
			region: 'GB',
		});

		expect(result.provider_name).toBe('Apple TV');
	});
});
