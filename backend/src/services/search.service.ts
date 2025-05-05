import { searchMedia } from '../services/tmdb.service';

export const searchMediaService = async (query: string) => {
	return searchMedia(query);
};
