import { searchMedia } from '../services/tmdb.service';

export const searchMediaService = async (query: string) => {
	const response = await searchMedia(query);
	return response;
};
