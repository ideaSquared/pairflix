import bcrypt from 'bcryptjs';
import { ActivityLog } from '../models/ActivityLog';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';
import { ActivityType } from '../services/activity.service';
import sequelize from './connection';

export async function seedDatabase() {
	if (process.env.NODE_ENV !== 'development') {
		return;
	}

	try {
		await sequelize.sync({ force: true });

		// Clear existing data
		await ActivityLog.destroy({ where: {} });
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
				status: 'banned',
			}),
			User.create({
				email: 'user3@example.com',
				username: 'user3',
				password_hash: password,
				preferences: defaultPreferences,

				status: 'suspended',
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
				status: 'watch_together_focused',
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
				status: 'watch_together_focused',
			}),

			// User 2's matching entries
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'watch_together_focused',
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
				status: 'watch_together_background',
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
				status: 'watch_together_background',
			}),

			// User 3's unique entry
			WatchlistEntry.create({
				user_id: user3.user_id,
				tmdb_id: sampleContent[6].tmdb_id,
				media_type: sampleContent[6].media_type,
				status: 'watch_together_focused',
			}),
		]);

		// Create activity logs for users
		const pastDate = (daysAgo: number): Date => {
			const date = new Date();
			date.setDate(date.getDate() - daysAgo);
			return date;
		};

		// Activity logs for user1
		await Promise.all([
			// Login activities
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(30),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(15),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(7),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(2),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(1),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: new Date(),
			}),

			// Profile updates
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_PROFILE_UPDATE,
				metadata: {
					changedFields: ['preferences.theme'],
					oldValue: 'light',
					newValue: 'dark',
				},
				created_at: pastDate(20),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_PASSWORD_CHANGE,
				created_at: pastDate(10),
			}),

			// Watchlist activities
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[0].title,
					tmdb_id: sampleContent[0].tmdb_id,
					media_type: sampleContent[0].media_type,
				},
				created_at: pastDate(25),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[1].title,
					tmdb_id: sampleContent[1].tmdb_id,
					media_type: sampleContent[1].media_type,
				},
				created_at: pastDate(24),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.WATCHLIST_UPDATE,
				metadata: {
					title: sampleContent[1].title,
					tmdb_id: sampleContent[1].tmdb_id,
					media_type: sampleContent[1].media_type,
					change: {
						status: {
							from: 'to_watch',
							to: 'watching',
						},
					},
				},
				created_at: pastDate(15),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.WATCHLIST_RATE,
				metadata: {
					title: sampleContent[1].title,
					tmdb_id: sampleContent[1].tmdb_id,
					media_type: sampleContent[1].media_type,
					rating: 4,
				},
				created_at: pastDate(5),
			}),

			// Match activities
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.MATCH_CREATE,
				metadata: {
					with_user: {
						user_id: user2.user_id,
						username: user2.username,
					},
				},
				created_at: pastDate(22),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.MATCH_VIEW,
				metadata: {
					match_id: '1',
					with_user: {
						user_id: user2.user_id,
						username: user2.username,
					},
				},
				created_at: pastDate(4),
			}),

			// Media search activity
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.MEDIA_SEARCH,
				metadata: {
					query: 'sci-fi movies',
					results_count: 15,
				},
				created_at: pastDate(3),
			}),
		]);

		// Activity logs for user2
		await Promise.all([
			// Login activities
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(28),
			}),
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(14),
			}),
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(6),
			}),
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(3),
			}),

			// Profile updates
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.USER_PROFILE_UPDATE,
				metadata: {
					changedFields: ['preferences.emailNotifications'],
					oldValue: false,
					newValue: true,
				},
				created_at: pastDate(18),
			}),

			// Watchlist activities
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[0].title,
					tmdb_id: sampleContent[0].tmdb_id,
					media_type: sampleContent[0].media_type,
				},
				created_at: pastDate(26),
			}),
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[5].title,
					tmdb_id: sampleContent[5].tmdb_id,
					media_type: sampleContent[5].media_type,
				},
				created_at: pastDate(21),
			}),
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.WATCHLIST_RATE,
				metadata: {
					title: sampleContent[5].title,
					tmdb_id: sampleContent[5].tmdb_id,
					media_type: sampleContent[5].media_type,
					rating: 5,
				},
				created_at: pastDate(6),
			}),

			// Match activities
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.MATCH_UPDATE,
				metadata: {
					match_id: '1',
					with_user: {
						user_id: user1.user_id,
						username: user1.username,
					},
					status: {
						from: 'pending',
						to: 'accepted',
					},
				},
				created_at: pastDate(20),
			}),

			// Media search activity
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.MEDIA_SEARCH,
				metadata: {
					query: 'fantasy tv shows',
					results_count: 12,
				},
				created_at: pastDate(2),
			}),
		]);

		// Activity logs for user3
		await Promise.all([
			// Login activities
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(29),
			}),
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(15),
			}),
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(5),
			}),

			// Watchlist activities
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[6].title,
					tmdb_id: sampleContent[6].tmdb_id,
					media_type: sampleContent[6].media_type,
				},
				created_at: pastDate(10),
			}),
		]);

		// Get admin user first to avoid potential undefined issues
		const adminUser = await User.findOne({ where: { username: 'admin' } });

		if (!adminUser || !adminUser.user_id) {
			console.warn(
				'Admin user not found or missing user_id, skipping admin activity creation'
			);
		} else {
			// Activity logs for admin using the safely retrieved user_id
			await Promise.all([
				// Login activities
				ActivityLog.create({
					user_id: adminUser.user_id,
					action: ActivityType.USER_LOGIN,
					created_at: pastDate(27),
				}),
				ActivityLog.create({
					user_id: adminUser.user_id,
					action: ActivityType.USER_LOGIN,
					created_at: pastDate(14),
				}),
				ActivityLog.create({
					user_id: adminUser.user_id,
					action: ActivityType.USER_LOGIN,
					created_at: pastDate(3),
				}),
				ActivityLog.create({
					user_id: adminUser.user_id,
					action: ActivityType.USER_LOGIN,
					created_at: pastDate(1),
				}),

				// Profile updates
				ActivityLog.create({
					user_id: adminUser.user_id,
					action: ActivityType.USER_PROFILE_UPDATE,
					metadata: {
						changedFields: ['preferences.theme'],
						oldValue: 'light',
						newValue: 'dark',
					},
					created_at: pastDate(19),
				}),
			]);
		}

		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}
