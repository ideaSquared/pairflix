import ActivityLog from '../../models/ActivityLog';
import AppSettings from '../../models/AppSettings';
import AuditLog from '../../models/AuditLog';
import Content from '../../models/Content';
import ContentReport from '../../models/ContentReport';
import Match from '../../models/Match';
import User from '../../models/User';
import WatchlistEntry from '../../models/WatchlistEntry';
import { ContentStatus, MediaType, WatchStatus } from '../../types';
import IntegrationTestSetup from './setup';

/**
 * Helper type to handle Sequelize queries with where clauses
 */
type QueryOptions = {
	where?: Record<string, any>;
	[key: string]: any;
};

/**
 * Consistent user IDs for testing
 */
const TEST_USER_ID = 'test-user-id';
const TEST_PARTNER_ID = 'partner-id';

/**
 * Test fixtures for integration tests
 */
export class TestFixtures {
	/**
	 * Ensure models are initialized before creating data
	 */
	private static async ensureModelsInitialized() {
		// Get the singleton test setup instance
		const testSetup = IntegrationTestSetup.getInstance();
		await testSetup.init();
	}

	/**
	 * Create test users with different roles
	 */
	static async createUsers() {
		await this.ensureModelsInitialized();

		// Set up mocks for the User.create calls
		const regularUser = {
			id: 'regular-user-id',
			username: 'testuser',
			email: 'testuser@example.com',
			password_hash:
				'$2a$10$RMQsrTnTZ7RXQ2lJWB4x/.4IzHP/6BFfz4ZBHJ5.mcqNkQmIKhsh6', // testpassword
			role: 'user',
			status: 'active',
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		};

		const adminUser = {
			id: 'admin-user-id',
			username: 'testadmin',
			email: 'testadmin@example.com',
			password_hash:
				'$2a$10$RMQsrTnTZ7RXQ2lJWB4x/.4IzHP/6BFfz4ZBHJ5.mcqNkQmIKhsh6', // testpassword
			role: 'admin',
			status: 'active',
			preferences: {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: false,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		};

		const partnerUser = {
			id: 'partner-user-id',
			username: 'testpartner',
			email: 'testpartner@example.com',
			password_hash:
				'$2a$10$RMQsrTnTZ7RXQ2lJWB4x/.4IzHP/6BFfz4ZBHJ5.mcqNkQmIKhsh6', // testpassword
			role: 'user',
			status: 'active',
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: [],
			},
		};

		// Mock the User.create method to return our predefined users
		User.create = jest
			.fn()
			.mockImplementationOnce(() => Promise.resolve(regularUser))
			.mockImplementationOnce(() => Promise.resolve(adminUser))
			.mockImplementationOnce(() => Promise.resolve(partnerUser));

		// Mock User.findByPk and User.findOne
		User.findByPk = jest.fn(id => {
			if (id === regularUser.id) return Promise.resolve(regularUser);
			if (id === adminUser.id) return Promise.resolve(adminUser);
			if (id === partnerUser.id) return Promise.resolve(partnerUser);
			return Promise.resolve(null);
		}) as unknown as typeof User.findByPk;

		User.findOne = jest.fn((options: QueryOptions) => {
			if (options?.where?.email === regularUser.email)
				return Promise.resolve(regularUser);
			if (options?.where?.email === adminUser.email)
				return Promise.resolve(adminUser);
			if (options?.where?.email === partnerUser.email)
				return Promise.resolve(partnerUser);
			return Promise.resolve(null);
		}) as unknown as typeof User.findOne;

		// Return our mock users directly without actually calling the database
		return { regularUser, adminUser, partnerUser };
	}

	/**
	 * Create test content entries
	 */
	static async createContent() {
		await this.ensureModelsInitialized();

		const movie1 = {
			id: 'movie-1-id',
			tmdb_id: 123456,
			title: 'Test Movie 1',
			type: 'movie',
			status: ContentStatus.ACTIVE,
		};

		const movie2 = {
			id: 'movie-2-id',
			tmdb_id: 234567,
			title: 'Test Movie 2',
			type: 'movie',
			status: ContentStatus.ACTIVE,
		};

		const tvShow = {
			id: 'tv-show-id',
			tmdb_id: 345678,
			title: 'Test TV Show',
			type: 'show',
			status: ContentStatus.ACTIVE,
		};

		const flaggedContent = {
			id: 'flagged-content-id',
			tmdb_id: 456789,
			title: 'Flagged Content',
			type: 'movie',
			status: ContentStatus.FLAGGED,
		};

		// Mock Content.create to return our predefined content
		Content.create = jest
			.fn()
			.mockImplementationOnce(() => Promise.resolve(movie1))
			.mockImplementationOnce(() => Promise.resolve(movie2))
			.mockImplementationOnce(() => Promise.resolve(tvShow))
			.mockImplementationOnce(() => Promise.resolve(flaggedContent));

		// Mock Content.findByPk
		Content.findByPk = jest.fn(id => {
			if (id === movie1.id) return Promise.resolve(movie1);
			if (id === movie2.id) return Promise.resolve(movie2);
			if (id === tvShow.id) return Promise.resolve(tvShow);
			if (id === flaggedContent.id) return Promise.resolve(flaggedContent);
			return Promise.resolve(null);
		}) as unknown as typeof Content.findByPk;

		// Mock Content.findOne
		Content.findOne = jest.fn((options: QueryOptions) => {
			if (options?.where?.tmdb_id === movie1.tmdb_id)
				return Promise.resolve(movie1);
			if (options?.where?.tmdb_id === movie2.tmdb_id)
				return Promise.resolve(movie2);
			if (options?.where?.tmdb_id === tvShow.tmdb_id)
				return Promise.resolve(tvShow);
			if (options?.where?.tmdb_id === flaggedContent.tmdb_id)
				return Promise.resolve(flaggedContent);
			return Promise.resolve(null);
		}) as unknown as typeof Content.findOne;

		return { movie1, movie2, tvShow, flaggedContent };
	}

	/**
	 * Create watchlist entries for test users
	 */
	static async createWatchlistEntries(
		userId: string = TEST_USER_ID,
		partnerId: string = TEST_PARTNER_ID
	) {
		await this.ensureModelsInitialized();

		const { movie1, movie2, tvShow } = await this.createContent();

		// User's watchlist entries
		const userEntry1 = {
			entry_id: 'user-entry-1-id',
			user_id: userId,
			tmdb_id: movie1.tmdb_id,
			media_type: MediaType.MOVIE,
			status: WatchStatus.WANT_TO_WATCH,
			tags: ['favorite', 'action'],
		};

		const userEntry2 = {
			entry_id: 'user-entry-2-id',
			user_id: userId,
			tmdb_id: movie2.tmdb_id,
			media_type: MediaType.MOVIE,
			status: WatchStatus.WATCHED,
			rating: 4,
			notes: 'I really enjoyed this movie',
			tags: ['comedy', 'weekend'],
		};

		// Partner's watchlist entries
		const partnerEntry1 = {
			entry_id: 'partner-entry-1-id',
			user_id: partnerId,
			tmdb_id: movie1.tmdb_id,
			media_type: MediaType.MOVIE,
			status: WatchStatus.WANT_TO_WATCH,
			tags: ['weekend'],
		};

		const partnerEntry2 = {
			entry_id: 'partner-entry-2-id',
			user_id: partnerId,
			tmdb_id: tvShow.tmdb_id,
			media_type: MediaType.TV,
			status: WatchStatus.WATCHING,
			tags: ['drama', 'sci-fi'],
		};

		// Mock WatchlistEntry.create
		WatchlistEntry.create = jest
			.fn()
			.mockImplementationOnce(() => Promise.resolve(userEntry1))
			.mockImplementationOnce(() => Promise.resolve(userEntry2))
			.mockImplementationOnce(() => Promise.resolve(partnerEntry1))
			.mockImplementationOnce(() => Promise.resolve(partnerEntry2));

		// Mock WatchlistEntry.findByPk
		WatchlistEntry.findByPk = jest.fn(id => {
			if (id === userEntry1.entry_id) return Promise.resolve(userEntry1);
			if (id === userEntry2.entry_id) return Promise.resolve(userEntry2);
			if (id === partnerEntry1.entry_id) return Promise.resolve(partnerEntry1);
			if (id === partnerEntry2.entry_id) return Promise.resolve(partnerEntry2);
			return Promise.resolve(null);
		}) as unknown as typeof WatchlistEntry.findByPk;

		// Mock WatchlistEntry.findAll
		const allEntries = [userEntry1, userEntry2, partnerEntry1, partnerEntry2];
		WatchlistEntry.findAll = jest.fn((options: QueryOptions) => {
			if (options?.where?.user_id === userId) {
				return Promise.resolve([userEntry1, userEntry2]);
			}
			if (options?.where?.user_id === partnerId) {
				return Promise.resolve([partnerEntry1, partnerEntry2]);
			}
			if (options?.where?.status === WatchStatus.WANT_TO_WATCH) {
				return Promise.resolve([userEntry1, partnerEntry1]);
			}
			return Promise.resolve(allEntries);
		}) as unknown as typeof WatchlistEntry.findAll;

		// Mock WatchlistEntry.findOne
		WatchlistEntry.findOne = jest.fn((options: QueryOptions) => {
			if (
				options?.where?.user_id === userId &&
				options?.where?.tmdb_id === movie1.tmdb_id
			) {
				return Promise.resolve(userEntry1);
			}
			if (
				options?.where?.user_id === userId &&
				options?.where?.tmdb_id === movie2.tmdb_id
			) {
				return Promise.resolve(userEntry2);
			}
			if (
				options?.where?.user_id === partnerId &&
				options?.where?.tmdb_id === movie1.tmdb_id
			) {
				return Promise.resolve(partnerEntry1);
			}
			if (
				options?.where?.user_id === partnerId &&
				options?.where?.tmdb_id === tvShow.tmdb_id
			) {
				return Promise.resolve(partnerEntry2);
			}
			return Promise.resolve(null);
		}) as unknown as typeof WatchlistEntry.findOne;

		return {
			userEntries: [userEntry1, userEntry2],
			partnerEntries: [partnerEntry1, partnerEntry2],
			content: { movie1, movie2, tvShow },
		};
	}

	/**
	 * Create test matches between users
	 */
	static async createMatches(userId: string, partnerId: string) {
		await this.ensureModelsInitialized();

		const { movie1 } = await this.createContent();

		const match = {
			match_id: 'match-id',
			user1_id: userId,
			user2_id: partnerId,
			entry_id: movie1.id,
			status: 'pending',
		};

		// Mock Match.create
		Match.create = jest.fn().mockResolvedValue(match);

		// Mock Match.findByPk
		Match.findByPk = jest.fn(id => {
			if (id === match.match_id) return Promise.resolve(match);
			return Promise.resolve(null);
		}) as unknown as typeof Match.findByPk;

		return { match };
	}

	/**
	 * Create test content reports
	 */
	static async createContentReports(userId: string) {
		await this.ensureModelsInitialized();

		const { flaggedContent } = await this.createContent();

		const report = {
			report_id: 'report-id',
			user_id: userId,
			content_id: flaggedContent.id,
			reason: 'inappropriate content',
			details: 'This content contains inappropriate material',
			status: 'pending',
		};

		// Mock ContentReport.create
		ContentReport.create = jest.fn().mockResolvedValue(report);

		// Mock ContentReport.findByPk
		ContentReport.findByPk = jest.fn(id => {
			if (id === report.report_id) return Promise.resolve(report);
			return Promise.resolve(null);
		}) as unknown as typeof ContentReport.findByPk;

		return { report, flaggedContent };
	}

	/**
	 * Create test activity logs
	 */
	static async createActivityLogs(userId: string, partnerId: string) {
		await this.ensureModelsInitialized();

		const activity1 = {
			log_id: 'activity-log-1-id',
			user_id: userId,
			action: 'WATCHLIST_ADD',
			context: 'user_activity',
			metadata: {
				tmdb_id: 123456,
				title: 'Test Movie 1',
				media_type: 'movie',
			},
		};

		const activity2 = {
			log_id: 'activity-log-2-id',
			user_id: partnerId,
			action: 'WATCHLIST_STATUS_UPDATE',
			context: 'user_activity',
			metadata: {
				tmdb_id: 234567,
				title: 'Test Movie 2',
				media_type: 'movie',
				old_status: 'want_to_watch',
				new_status: 'watched',
			},
		};

		// Mock ActivityLog.create
		ActivityLog.create = jest
			.fn()
			.mockImplementationOnce(() => Promise.resolve(activity1))
			.mockImplementationOnce(() => Promise.resolve(activity2));

		// Mock ActivityLog.findByPk
		ActivityLog.findByPk = jest.fn(id => {
			if (id === activity1.log_id) return Promise.resolve(activity1);
			if (id === activity2.log_id) return Promise.resolve(activity2);
			return Promise.resolve(null);
		}) as unknown as typeof ActivityLog.findByPk;

		// Mock ActivityLog.findAll
		ActivityLog.findAll = jest.fn((options: QueryOptions) => {
			if (options?.where?.user_id === userId) {
				return Promise.resolve([activity1]);
			}
			if (options?.where?.user_id === partnerId) {
				return Promise.resolve([activity2]);
			}
			return Promise.resolve([activity1, activity2]);
		}) as unknown as typeof ActivityLog.findAll;

		return { activity1, activity2 };
	}

	/**
	 * Create test audit logs
	 */
	static async createAuditLogs(adminId: string) {
		await this.ensureModelsInitialized();

		const audit1 = {
			log_id: 'audit-log-1-id',
			level: 'info',
			message: 'User status updated',
			context: {
				user_id: 'some-user-id',
				old_status: 'active',
				new_status: 'suspended',
				admin_id: adminId,
			},
			source: 'admin-panel',
		};

		const audit2 = {
			log_id: 'audit-log-2-id',
			level: 'warn',
			message: 'Content status updated',
			context: {
				tmdb_id: 456789,
				old_status: 'active',
				new_status: 'flagged',
				admin_id: adminId,
			},
			source: 'content-moderation',
		};

		// Mock AuditLog.create
		AuditLog.create = jest
			.fn()
			.mockImplementationOnce(() => Promise.resolve(audit1))
			.mockImplementationOnce(() => Promise.resolve(audit2));

		// Mock AuditLog.findByPk
		AuditLog.findByPk = jest.fn(id => {
			if (id === audit1.log_id) return Promise.resolve(audit1);
			if (id === audit2.log_id) return Promise.resolve(audit2);
			return Promise.resolve(null);
		}) as unknown as typeof AuditLog.findByPk;

		// Mock AuditLog.findAll
		AuditLog.findAll = jest.fn(() => {
			return Promise.resolve([audit1, audit2]);
		}) as unknown as typeof AuditLog.findAll;

		return { audit1, audit2 };
	}

	/**
	 * Create test app settings
	 */
	static async createAppSettings() {
		await this.ensureModelsInitialized();

		const settings = {
			settings_id: 'settings-id',
			key: 'system_settings',
			value: {
				maintenance_mode: false,
				registration_enabled: true,
				theme: {
					primary_color: '#3498db',
					secondary_color: '#2ecc71',
				},
				content_filters: {
					min_vote_average: 5.0,
					allowed_media_types: ['movie', 'tv'],
				},
				feature_flags: {
					enable_recommendations: true,
					enable_activity_feed: true,
					enable_content_reports: true,
				},
			},
			category: 'system',
			description: 'System-wide configuration settings',
		};

		// Mock AppSettings.create
		AppSettings.create = jest.fn().mockResolvedValue(settings);

		// Mock AppSettings.findByPk
		AppSettings.findByPk = jest.fn(id => {
			if (id === settings.settings_id) return Promise.resolve(settings);
			return Promise.resolve(null);
		}) as unknown as typeof AppSettings.findByPk;

		// Mock AppSettings.findOne
		AppSettings.findOne = jest.fn((options: QueryOptions) => {
			if (options?.where?.key === settings.key)
				return Promise.resolve(settings);
			return Promise.resolve(null);
		}) as unknown as typeof AppSettings.findOne;

		return { settings };
	}
}
