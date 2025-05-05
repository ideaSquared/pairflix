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
			// Match.create({
			// 	user1_id: user1.user_id,
			// 	user2_id: user3.user_id,
			// 	status: 'pending',
			// }),
		]);

		// Sample TMDb IDs for popular movies/shows
		const sampleContent = [
			{ tmdb_id: 299536, media_type: 'movie' }, // Avengers: Infinity War
			{ tmdb_id: 1399, media_type: 'tv' }, // Game of Thrones
			{ tmdb_id: 299534, media_type: 'movie' }, // Avengers: Endgame
			{ tmdb_id: 66732, media_type: 'tv' }, // Stranger Things
		];

		// Create watchlist entries for both users
		await Promise.all([
			// User 1's entries
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'finished',
				rating: 9,
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
				rating: 8,
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
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'to_watch_together',
			}),
		]);

		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}
