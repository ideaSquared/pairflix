import WatchlistEntry from '../models/WatchlistEntry';
import { getMovieDetails } from './tmdb.service';
import {
	addToWatchlistService,
	getWatchlistService,
	updateWatchlistEntryService,
} from './watchlist.service';

jest.mock('../models/WatchlistEntry');
jest.mock('./tmdb.service');

describe('Watchlist Service', () => {
	describe('addToWatchlistService', () => {
		it('should add an entry to the watchlist', async () => {
			(WatchlistEntry.create as jest.Mock).mockResolvedValue({
				entry_id: 'entry-1',
			});

			const entry = await addToWatchlistService(
				{ user_id: 'user-1' },
				{
					tmdb_id: 123,
					media_type: 'movie',
					status: 'want_to_watch',
					notes: 'Test notes',
				}
			);
			expect(entry).toEqual({ entry_id: 'entry-1' });
		});
	});

	describe('getWatchlistService', () => {
		it('should return enriched watchlist entries', async () => {
			const mockEntries = [
				{
					entry_id: 'entry-1',
					tmdb_id: 123,
					toJSON: () => ({ entry_id: 'entry-1', tmdb_id: 123 }),
				},
			];
			const mockDetails = {
				title: 'Test Movie',
				poster_path: '/path.jpg',
				overview: 'Test overview',
			};
			(WatchlistEntry.findAll as jest.Mock).mockResolvedValue(mockEntries);
			(getMovieDetails as jest.Mock).mockResolvedValue(mockDetails);

			const watchlist = await getWatchlistService({ user_id: 'user-1' });
			expect(watchlist).toEqual([
				{
					entry_id: 'entry-1',
					tmdb_id: 123,
					title: 'Test Movie',
					poster_path: '/path.jpg',
					overview: 'Test overview',
				},
			]);
		});
	});

	describe('updateWatchlistEntryService', () => {
		it('should update a watchlist entry', async () => {
			(WatchlistEntry.update as jest.Mock).mockResolvedValue([1]);
			(WatchlistEntry.findByPk as jest.Mock).mockResolvedValue({
				entry_id: 'entry-1',
			});

			const updatedEntry = await updateWatchlistEntryService(
				'entry-1',
				{ status: 'watched' },
				{ user_id: 'user-1' }
			);
			expect(updatedEntry).toEqual({ entry_id: 'entry-1' });
		});

		it('should throw an error if entry not found', async () => {
			(WatchlistEntry.update as jest.Mock).mockResolvedValue([0]);

			await expect(
				updateWatchlistEntryService(
					'entry-1',
					{ status: 'watched' },
					{ user_id: 'user-1' }
				)
			).rejects.toThrow('Entry not found');
		});
	});
});
