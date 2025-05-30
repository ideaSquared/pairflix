import bcrypt from 'bcryptjs';
import { ActivityLog } from '../models/ActivityLog';
import AppSettings from '../models/AppSettings';
import AuditLog from '../models/AuditLog';
import Content from '../models/Content';
import ContentReport from '../models/ContentReport';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';
import { ActivityType } from '../services/activity.service';
import { auditLogService } from '../services/audit.service';
import { settingsService } from '../services/settings.service';
import sequelize from './connection';

// Helper function for creating past dates
const pastDate = (daysAgo: number): Date => {
	const date = new Date();
	date.setDate(date.getDate() - daysAgo);
	return date;
};

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
		await AppSettings.destroy({ where: {} });
		await AuditLog.destroy({ where: {} });
		await Content.destroy({ where: {} });
		await ContentReport.destroy({ where: {} });

		// Create test users with default preferences
		const password = await bcrypt.hash('1234', 10);
		const defaultPreferences = {
			theme: 'dark' as const,
			viewStyle: 'grid' as const,
			emailNotifications: true,
			autoArchiveDays: 30,
			favoriteGenres: [] as string[],
		};

		const [user1, user2, user3, adminUser] = await Promise.all([
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

		if (!user1 || !user2 || !user3 || !adminUser) {
			throw new Error('Failed to create test users');
		}

		// Initialize default app settings using the settings service
		await settingsService.initializeDefaultSettings();
		console.log('Default app settings created');

		// Create an audit log entry for the initial settings creation
		await auditLogService.info(
			'Initial application settings created',
			'db-seeder',
			{
				userId: adminUser.user_id,
				timestamp: new Date(),
			}
		);

		// Create an activity log entry for the admin user creating settings
		await ActivityLog.create({
			user_id: adminUser.user_id,
			action: ActivityType.SYSTEM_CONFIG,
			context: 'system',
			metadata: {
				action: 'initialize_app_settings',
				timestamp: new Date(),
			},
			created_at: new Date(),
		});

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

		// Additional admin activities related to system management
		await Promise.all([
			// Existing admin activities
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
			// Admin specific activities - system settings update
			ActivityLog.create({
				user_id: adminUser.user_id,
				action: ActivityType.SYSTEM_CONFIG,
				context: 'system',
				metadata: {
					action: 'update_app_settings',
					changes: {
						'general.siteName': {
							from: 'PairFlix',
							to: 'PairFlix Beta',
						},
						'features.enableNewRecommendations': {
							from: false,
							to: true,
						},
					},
				},
				created_at: pastDate(5),
			}),
			// System maintenance activity
			ActivityLog.create({
				user_id: adminUser.user_id,
				action: ActivityType.SYSTEM_MAINTENANCE,
				context: 'system',
				metadata: {
					action: 'clear_expired_sessions',
					count: 12,
				},
				created_at: pastDate(2),
			}),
		]);

		// Sample content items with indices
		const contentIndex = {
			matrix: 0,
			breakingBad: 1,
			strangerThings: 2,
			inception: 3,
			gameOfThrones: 4,
		} as const;

		const contentItems = [
			{
				title: 'The Matrix',
				type: 'movie' as const,
				status: 'active' as const,
				tmdb_id: 603,
				reported_count: 0,
			},
			{
				title: 'Breaking Bad',
				type: 'show' as const,
				status: 'active' as const,
				tmdb_id: 1396,
				reported_count: 2,
			},
			{
				title: 'Stranger Things',
				type: 'show' as const,
				status: 'pending' as const,
				tmdb_id: 66732,
				reported_count: 0,
			},
			{
				title: 'Inception',
				type: 'movie' as const,
				status: 'flagged' as const,
				tmdb_id: 27205,
				reported_count: 3,
			},
			{
				title: 'Game of Thrones',
				type: 'show' as const,
				status: 'removed' as const,
				tmdb_id: 1399,
				reported_count: 5,
				removal_reason: 'Content violates community guidelines',
			},
		] as const;

		const createdContent = (await Promise.all(
			contentItems.map(item => Content.create(item))
		)) as Content[];

		// Validate that all content was created
		if (
			createdContent.length !== contentItems.length ||
			createdContent.some(c => !c)
		) {
			throw new Error('Failed to create all content items');
		}

		// Create sample content reports
		const reports = [
			{
				content_id: createdContent[contentIndex.breakingBad]!.id,
				user_id: user1.user_id,
				reason: 'Inappropriate content',
				details: 'Contains excessive violence',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.breakingBad]!.id,
				user_id: user2.user_id,
				reason: 'Age rating concern',
				details: 'Content may not be suitable for the specified age group',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.inception]!.id,
				user_id: user1.user_id,
				reason: 'Misleading description',
				details: 'Plot summary is inaccurate',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.inception]!.id,
				user_id: user3.user_id,
				reason: 'Wrong categorization',
				details: 'Should be categorized as sci-fi',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.inception]!.id,
				user_id: user2.user_id,
				reason: 'Technical issue',
				details: 'Video playback issues',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.gameOfThrones]!.id,
				user_id: user1.user_id,
				reason: 'Inappropriate content',
				details: 'Extremely graphic content',
				status: 'resolved' as const,
			},
			{
				content_id: createdContent[contentIndex.gameOfThrones]!.id,
				user_id: user2.user_id,
				reason: 'Age restriction',
				details: 'Content needs higher age rating',
				status: 'resolved' as const,
			},
		] as const;

		await Promise.all(reports.map(report => ContentReport.create(report)));

		// Create activity logs for content moderation
		await Promise.all([
			ActivityLog.create({
				user_id: adminUser.user_id,
				action: ActivityType.CONTENT_MODERATION,
				context: 'system',
				metadata: {
					action: 'flag_content',
					content_id: createdContent[contentIndex.inception]!.id,
					title: createdContent[contentIndex.inception]!.title,
				},
				created_at: new Date(),
			}),
			ActivityLog.create({
				user_id: adminUser.user_id,
				action: ActivityType.CONTENT_MODERATION,
				context: 'system',
				metadata: {
					action: 'remove_content',
					content_id: createdContent[contentIndex.gameOfThrones]!.id,
					title: createdContent[contentIndex.gameOfThrones]!.title,
					reason: 'Content violates community guidelines',
				},
				created_at: new Date(),
			}),
		]);

		console.log('Database seeded successfully!');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}
