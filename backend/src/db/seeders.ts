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

		// Create test users
		const password = await bcrypt.hash('testpass123', 10);
		const [user1, user2, user3] = await Promise.all([
			User.create({
				email: 'user1@example.com',
				password_hash: password,
			}),
			User.create({
				email: 'user2@example.com',
				password_hash: password,
			}),
			User.create({
				email: 'user3@example.com',
				password_hash: password,
			}),
		]);

		// Create sample matches
		await Promise.all([
			Match.create({
				user1_id: user1.user_id,
				user2_id: user2.user_id,
				status: 'accepted',
			}),
		]);

		// Sample TMDb IDs for popular movies/shows (all verified to exist)
		const sampleContent: Array<{
			tmdb_id: number;
			media_type: 'movie' | 'tv';
		}> = [
			{ tmdb_id: 1233069, media_type: 'movie' }, // Exterritorial
			{ tmdb_id: 2734, media_type: 'tv' }, // Law & Order: SVU
			{ tmdb_id: 986056, media_type: 'movie' }, // Thunderbolts
			{ tmdb_id: 1124620, media_type: 'movie' }, // The Monkey
		];

		// Create watchlist entries for both users
		await Promise.all([
			// User 1's entries
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'finished',
				rating: 5,
			}),
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'watching',
			}),

			// User 2's entries
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'finished',
				rating: 4,
			}),
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[2].tmdb_id,
				media_type: sampleContent[2].media_type,
				status: 'to_watch',
			}),

			// User 3's entries
			WatchlistEntry.create({
				user_id: user3.user_id,
				tmdb_id: sampleContent[3].tmdb_id,
				media_type: sampleContent[3].media_type,
				status: 'to_watch_together',
			}),
		]);

		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}
