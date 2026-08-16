import { searchMediaService } from './search.service';
import { searchMedia } from './tmdb.service';

jest.mock('./tmdb.service');

describe('searchMediaService', () => {
	it('should return search results', async () => {
		const mockResults = [{ id: 1, title: 'Test Movie' }];
		(searchMedia as jest.Mock).mockResolvedValue(mockResults);

		const results = await searchMediaService('test query');
		expect(results).toEqual(mockResults);
	});

	it('should throw an error if TMDb service fails', async () => {
		(searchMedia as jest.Mock).mockRejectedValue(new Error('TMDb API error'));

		await expect(searchMediaService('test query')).rejects.toThrow(
			'TMDb API error'
		);
	});
});
