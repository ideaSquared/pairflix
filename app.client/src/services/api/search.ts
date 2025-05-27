// filepath: c:\Users\thete\Desktop\localdev\pairflix\frontend\src\services\api\search.ts
import { fetchWithAuth, SearchResponse, SearchResult } from './utils';

export const search = {
	media: async (query: string): Promise<SearchResult[]> => {
		const response = (await fetchWithAuth(
			`/api/search/media?query=${encodeURIComponent(query)}`
		)) as SearchResponse;
		return response.results || [];
	},
};
