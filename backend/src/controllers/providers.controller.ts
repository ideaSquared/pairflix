import type { Request, Response } from 'express';
import { getProvidersForContent } from '../services/providers.service';

const isMediaType = (value: unknown): value is 'movie' | 'tv' =>
	value === 'movie' || value === 'tv';

export const getProviders = async (req: Request, res: Response) => {
	try {
		const tmdbIdRaw = req.params.tmdbId;
		const mediaTypeRaw = req.query.media_type;
		const regionRaw = req.query.region;

		const tmdbId = tmdbIdRaw ? Number.parseInt(tmdbIdRaw, 10) : NaN;
		if (Number.isNaN(tmdbId)) {
			return res.status(400).json({ error: 'Invalid tmdb_id' });
		}

		if (!isMediaType(mediaTypeRaw)) {
			return res
				.status(400)
				.json({ error: 'media_type must be "movie" or "tv"' });
		}

		const regionCandidate =
			typeof regionRaw === 'string' ? regionRaw.toUpperCase() : '';
		if (regionCandidate && !/^[A-Z]{2}$/.test(regionCandidate)) {
			return res.status(400).json({ error: 'region must be a 2-letter code' });
		}
		const region = regionCandidate || 'GB';

		const providers = await getProvidersForContent(tmdbId, mediaTypeRaw, {
			region,
		});

		return res.json({ region, providers });
	} catch (error) {
		if (error instanceof Error) {
			return res.status(500).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Unknown error occurred' });
	}
};
