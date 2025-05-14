import bcrypt from 'bcryptjs';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';
import sequelize from './connection';

export async function seedDatabase() {
	if (process.env.NODE_ENV !== 'development') {
		return;
	}

	try {
		await sequelize.sync({ force: true });

		// Clear existing data
		await WatchlistEntry.destroy({ where: {} });
		await Match.destroy({ where: {} });
		await User.destroy({ where: {} });

		// Create test users with usernames
		const password = await bcrypt.hash('1234', 10);
		const defaultPreferences = {
			theme: 'dark' as const,
			viewStyle: 'grid' as const,
			emailNotifications: true,
			autoArchiveDays: 30,
			favoriteGenres: [] as string[],
		};

		const [user1, user2, user3] = await Promise.all([
			User.create({
				email: 'user1@example.com',
				username: 'user1',
				password_hash: password,
				preferences: defaultPreferences,
			}),
			User.create({
				email: 'user2@example.com',
				username: 'user2',
				password_hash: password,
				preferences: defaultPreferences,
			}),
			User.create({
				email: 'user3@example.com',
				username: 'user3',
				password_hash: password,
				preferences: defaultPreferences,
			}),
			User.create({
				email: 'admin@example.com',
				username: 'admin',
				password_hash: password,
				preferences: defaultPreferences,
				role: 'admin',
			}),
		]);

		if (!user1 || !user2 || !user3) {
			throw new Error('Failed to create test users');
		}

		// Create accepted match between user1 and user2
		await Match.create({
			user1_id: user1.user_id,
			user2_id: user2.user_id,
			status: 'accepted',
		});

		// Sample TMDb IDs for popular movies/shows (all verified to exist)
		const sampleContent = [
			// Movies both users want to watch together
			{
				tmdb_id: 1233069,
				media_type: 'movie' as const,
				title: 'Exterritorial',
			}, // Both want to watch together
			{ tmdb_id: 986056, media_type: 'movie' as const, title: 'Thunderbolts' }, // Both watching
			{
				tmdb_id: 693134,
				media_type: 'movie' as const,
				title: 'Dune: Part Two',
			}, // Both to watch

			// TV Shows with matching interest
			{ tmdb_id: 2734, media_type: 'tv' as const, title: 'Law & Order: SVU' }, // Both watching
			{ tmdb_id: 1396, media_type: 'tv' as const, title: 'Breaking Bad' }, // Both finished
			{ tmdb_id: 1399, media_type: 'tv' as const, title: 'Game of Thrones' }, // Both want to watch together

			// Non-matching content
			{ tmdb_id: 1124620, media_type: 'movie' as const, title: 'The Monkey' }, // Only user3
		] as const;

		// Create matching watchlist entries for both users
		await Promise.all([
			// User 1's entries
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'to_watch_together',
			}),
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'watching',
				rating: 4,
			}),
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[2].tmdb_id,
				media_type: sampleContent[2].media_type,
				status: 'to_watch',
			}),
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[3].tmdb_id,
				media_type: sampleContent[3].media_type,
				status: 'watching',
			}),
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[4].tmdb_id,
				media_type: sampleContent[4].media_type,
				status: 'finished',
				rating: 5,
			}),
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[5].tmdb_id,
				media_type: sampleContent[5].media_type,
				status: 'to_watch_together',
			}),

			// User 2's matching entries
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'to_watch_together',
			}),
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'watching',
				rating: 5,
			}),
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[2].tmdb_id,
				media_type: sampleContent[2].media_type,
				status: 'would_like_to_watch_together',
			}),
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[3].tmdb_id,
				media_type: sampleContent[3].media_type,
				status: 'watching',
			}),
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[4].tmdb_id,
				media_type: sampleContent[4].media_type,
				status: 'finished',
				rating: 5,
			}),
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[5].tmdb_id,
				media_type: sampleContent[5].media_type,
				status: 'would_like_to_watch_together',
			}),

			// User 3's unique entry
			WatchlistEntry.create({
				user_id: user3.user_id,
				tmdb_id: sampleContent[6].tmdb_id,
				media_type: sampleContent[6].media_type,
				status: 'to_watch_together',
			}),
		]);

		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}
