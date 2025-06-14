import { ActivityLog } from '../models/ActivityLog';
import AppSettings from '../models/AppSettings';
import AuditLog from '../models/AuditLog';
import Content from '../models/Content';
import ContentReport from '../models/ContentReport';
import EmailVerification from '../models/EmailVerification';
import Group from '../models/Group';
import GroupMember from '../models/GroupMember';
import PasswordReset from '../models/PasswordReset';
import User from '../models/User';
import UserSession from '../models/UserSession';
import WatchlistEntry from '../models/WatchlistEntry';
import { ActivityType } from '../services/activity.service';
import { auditLogService } from '../services/audit.service';
import { settingsService } from '../services/settings.service';
import sequelize from './connection';

export async function seedDatabase() {
	if (process.env.NODE_ENV !== 'development') {
		return;
	}

	try {
		// Initialize all models
		User.initialize(sequelize);
		WatchlistEntry.initialize(sequelize);
		Group.initialize(sequelize);
		GroupMember.initialize(sequelize);
		ActivityLog.initialize(sequelize);
		AuditLog.initialize(sequelize);
		AppSettings.initialize(sequelize);
		Content.initialize(sequelize);
		ContentReport.initialize(sequelize);
		EmailVerification.initialize(sequelize);
		PasswordReset.initialize(sequelize);
		UserSession.initialize(sequelize);

		// Sync the database (this will create tables with the updated schema)
		await sequelize.sync({ force: true });

		console.log('✅ Database synced successfully');

		// Create test users with different statuses
		// All test users have password: "password123"
		const testPasswordHash =
			'$2b$12$Ov0COOP9d5vnhIkIzoK4GeLk9/XJAGLq5eEQZIU7jeD1VNcGV5SZ2';

		const userActive = await User.create({
			email: 'useractive@example.com',
			username: 'useractive',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-15T10:00:00Z'),
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: ['Action', 'Sci-Fi'],
			},
		});

		const userBanned = await User.create({
			email: 'userbanned@example.com',
			username: 'userbanned',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'banned',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-10T15:30:00Z'),
			preferences: {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: false,
				autoArchiveDays: 60,
				favoriteGenres: ['Drama', 'Romance'],
			},
		});

		const userSuspended = await User.create({
			email: 'usersuspended@example.com',
			username: 'usersuspended',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'suspended',
			email_verified: false,
			failed_login_attempts: 3,
			locked_until: new Date(Date.now() + 15 * 60 * 1000), // Locked for 15 minutes
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: ['Horror', 'Thriller'],
			},
		});

		// Create 10 additional test users
		const user1 = await User.create({
			email: 'user1@example.com',
			username: 'user1',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-12T09:00:00Z'),
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 30,
				favoriteGenres: ['Comedy', 'Adventure'],
			},
		});

		const user2 = await User.create({
			email: 'user2@example.com',
			username: 'user2',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-14T11:30:00Z'),
			preferences: {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: true,
				autoArchiveDays: 45,
				favoriteGenres: ['Fantasy', 'Animation'],
			},
		});

		const user3 = await User.create({
			email: 'user3@example.com',
			username: 'user3',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: false,
			failed_login_attempts: 1,
			last_login: new Date('2024-01-13T14:20:00Z'),
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: false,
				autoArchiveDays: 20,
				favoriteGenres: ['Mystery', 'Crime'],
			},
		});

		const user4 = await User.create({
			email: 'user4@example.com',
			username: 'user4',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'suspended',
			email_verified: true,
			failed_login_attempts: 2,
			locked_until: new Date(Date.now() + 30 * 60 * 1000), // Locked for 30 minutes
			last_login: new Date('2024-01-09T16:45:00Z'),
			preferences: {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: true,
				autoArchiveDays: 60,
				favoriteGenres: ['Documentary', 'History'],
			},
		});

		const user5 = await User.create({
			email: 'user5@example.com',
			username: 'user5',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-16T08:15:00Z'),
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 35,
				favoriteGenres: ['Western', 'War'],
			},
		});

		const user6 = await User.create({
			email: 'user6@example.com',
			username: 'user6',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-11T13:00:00Z'),
			preferences: {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: false,
				autoArchiveDays: 40,
				favoriteGenres: ['Musical', 'Family'],
			},
		});

		const user7 = await User.create({
			email: 'user7@example.com',
			username: 'user7',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'banned',
			email_verified: true,
			failed_login_attempts: 5,
			last_login: new Date('2024-01-08T17:30:00Z'),
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: false,
				autoArchiveDays: 15,
				favoriteGenres: ['Horror', 'Thriller'],
			},
		});

		const user8 = await User.create({
			email: 'user8@example.com',
			username: 'user8',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: false,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-17T12:45:00Z'),
			preferences: {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: true,
				autoArchiveDays: 25,
				favoriteGenres: ['Biography', 'Sport'],
			},
		});

		const user9 = await User.create({
			email: 'user9@example.com',
			username: 'user9',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'active',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date('2024-01-15T19:20:00Z'),
			preferences: {
				theme: 'dark',
				viewStyle: 'grid',
				emailNotifications: true,
				autoArchiveDays: 50,
				favoriteGenres: ['Music', 'News'],
			},
		});

		const user10 = await User.create({
			email: 'user10@example.com',
			username: 'user10',
			password_hash: testPasswordHash,
			role: 'user',
			status: 'suspended',
			email_verified: true,
			failed_login_attempts: 4,
			locked_until: new Date(Date.now() + 45 * 60 * 1000), // Locked for 45 minutes
			last_login: new Date('2024-01-07T21:10:00Z'),
			preferences: {
				theme: 'light',
				viewStyle: 'list',
				emailNotifications: false,
				autoArchiveDays: 10,
				favoriteGenres: ['Reality', 'Talk'],
			},
		});

		const adminUser = await User.create({
			email: 'admin@example.com',
			username: 'admin',
			password_hash: testPasswordHash,
			role: 'admin',
			status: 'active',
			email_verified: true,
			failed_login_attempts: 0,
			last_login: new Date(),
			preferences: {
				theme: 'dark',
				viewStyle: 'list',
				emailNotifications: true,
				autoArchiveDays: 7,
				favoriteGenres: ['Documentary', 'Biography'],
			},
		});

		console.log('✅ Created test users');

		// Create sample user sessions using actual user IDs
		await UserSession.bulkCreate([
			{
				user_id: userActive.user_id,
				token_hash: 'sample-token-hash-1',
				device_info: 'Chrome Browser',
				ip_address: '192.168.1.100',
				user_agent:
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				last_activity: new Date(),
			},
			{
				user_id: userActive.user_id,
				token_hash: 'sample-token-hash-2',
				device_info: 'Mobile Device',
				ip_address: '192.168.1.101',
				user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
			},
			{
				user_id: adminUser.user_id,
				token_hash: 'admin-token-hash-1',
				device_info: 'Firefox Browser',
				ip_address: '10.0.0.1',
				user_agent:
					'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
				expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
				last_activity: new Date(),
			},
		]);

		console.log('✅ Created sample user sessions');

		// Initialize default app settings using the settings service
		await settingsService.initializeDefaultSettings();
		console.warn('Default app settings created');

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

		// Create groups (couples) to replace matches
		// Group 1: userActive + userBanned (active)
		const group1 = await Group.create({
			name: 'useractive & userbanned',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: userActive.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group1.group_id,
				user_id: userActive.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group1.group_id,
				user_id: userBanned.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 2: user1 + user2 (active)
		const group2 = await Group.create({
			name: 'user1 & user2',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: user1.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group2.group_id,
				user_id: user1.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group2.group_id,
				user_id: user2.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 3: user2 + user5 (active)
		const group3 = await Group.create({
			name: 'user2 & user5',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: user2.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group3.group_id,
				user_id: user2.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group3.group_id,
				user_id: user5.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 4: user3 + user6 (active)
		const group4 = await Group.create({
			name: 'user3 & user6',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: user3.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group4.group_id,
				user_id: user3.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group4.group_id,
				user_id: user6.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 5: user8 + user9 (active)
		const group5 = await Group.create({
			name: 'user8 & user9',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: user8.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group5.group_id,
				user_id: user8.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group5.group_id,
				user_id: user9.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 6: user3 + user5 (active)
		const group6 = await Group.create({
			name: 'user3 & user5',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: user3.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group6.group_id,
				user_id: user3.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group6.group_id,
				user_id: user5.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 7: user6 + user9 (active)
		const group7 = await Group.create({
			name: 'user6 & user9',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: user6.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group7.group_id,
				user_id: user6.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group7.group_id,
				user_id: user9.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 8: userActive + user1 (active)
		const group8 = await Group.create({
			name: 'useractive & user1',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: userActive.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group8.group_id,
				user_id: userActive.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group8.group_id,
				user_id: user1.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 9: userSuspended + user8 (active)
		const group9 = await Group.create({
			name: 'usersuspended & user8',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: userSuspended.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group9.group_id,
				user_id: userSuspended.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group9.group_id,
				user_id: user8.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Group 10: user4 + user7 (active)
		const group10 = await Group.create({
			name: 'user4 & user7',
			type: 'couple',
			status: 'active',
			max_members: 2,
			created_by: user4.user_id,
		});

		await Promise.all([
			GroupMember.create({
				group_id: group10.group_id,
				user_id: user4.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: group10.group_id,
				user_id: user7.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Create a friend group with multiple members
		const friendGroup = await Group.create({
			name: 'Movie Night Crew',
			description: 'Weekly movie night friends',
			type: 'friends',
			status: 'active',
			max_members: 8,
			created_by: user1.user_id,
			settings: {
				isPublic: false,
				requireApproval: true,
				allowInvites: true,
				scheduleSettings: {
					recurringDay: 'friday',
					recurringTime: '20:00',
				},
			},
		});

		// Add members to friend group
		await Promise.all([
			GroupMember.create({
				group_id: friendGroup.group_id,
				user_id: user1.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: friendGroup.group_id,
				user_id: user3.user_id,
				role: 'admin',
				status: 'active',
			}),
			GroupMember.create({
				group_id: friendGroup.group_id,
				user_id: user5.user_id,
				role: 'member',
				status: 'active',
			}),
			GroupMember.create({
				group_id: friendGroup.group_id,
				user_id: user6.user_id,
				role: 'member',
				status: 'active',
			}),
			GroupMember.create({
				group_id: friendGroup.group_id,
				user_id: user8.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Create a watch party group
		const watchPartyGroup = await Group.create({
			name: 'Sunday Binge Watchers',
			description: 'Sunday afternoon TV series binge watching',
			type: 'watch_party',
			status: 'active',
			max_members: 12,
			created_by: user2.user_id,
			settings: {
				isPublic: true,
				requireApproval: false,
				allowInvites: true,
				scheduleSettings: {
					recurringDay: 'sunday',
					recurringTime: '14:00',
				},
			},
		});

		// Add members to watch party
		await Promise.all([
			GroupMember.create({
				group_id: watchPartyGroup.group_id,
				user_id: user2.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: watchPartyGroup.group_id,
				user_id: user4.user_id,
				role: 'admin',
				status: 'active',
			}),
			GroupMember.create({
				group_id: watchPartyGroup.group_id,
				user_id: user7.user_id,
				role: 'member',
				status: 'active',
			}),
			GroupMember.create({
				group_id: watchPartyGroup.group_id,
				user_id: user9.user_id,
				role: 'member',
				status: 'active',
			}),
			GroupMember.create({
				group_id: watchPartyGroup.group_id,
				user_id: user10.user_id,
				role: 'member',
				status: 'active',
			}),
			GroupMember.create({
				group_id: watchPartyGroup.group_id,
				user_id: userActive.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

		// Create additional couple group for testing multiple relationships
		// User3 is now in both a couple (group4 with user6) and friend group (friendGroup)
		// User1 is in both a couple (group2 with user2) and friend group (friendGroup)
		// userActive is in multiple groups: couple with userBanned, couple with user1, and watch party

		// Create another friend group with some overlapping members
		const collegeGroup = await Group.create({
			name: 'College Alumni Watch Group',
			description: 'Old college friends catching up through movies',
			type: 'friends',
			status: 'active',
			max_members: 6,
			created_by: user5.user_id,
			settings: {
				isPublic: false,
				requireApproval: true,
				allowInvites: false,
			},
		});

		await Promise.all([
			GroupMember.create({
				group_id: collegeGroup.group_id,
				user_id: user5.user_id,
				role: 'owner',
				status: 'active',
			}),
			GroupMember.create({
				group_id: collegeGroup.group_id,
				user_id: user6.user_id,
				role: 'member',
				status: 'active',
			}),
			GroupMember.create({
				group_id: collegeGroup.group_id,
				user_id: user9.user_id,
				role: 'member',
				status: 'active',
			}),
			GroupMember.create({
				group_id: collegeGroup.group_id,
				user_id: userBanned.user_id,
				role: 'member',
				status: 'active',
			}),
		]);

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

		// Create matching watchlist entries for users
		await Promise.all([
			// UserActive's entries
			WatchlistEntry.create({
				user_id: userActive.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'watch_together_focused',
			}),
			WatchlistEntry.create({
				user_id: userActive.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'watching',
				rating: 4,
			}),
			WatchlistEntry.create({
				user_id: userActive.user_id,
				tmdb_id: sampleContent[2].tmdb_id,
				media_type: sampleContent[2].media_type,
				status: 'to_watch',
			}),
			WatchlistEntry.create({
				user_id: userActive.user_id,
				tmdb_id: sampleContent[3].tmdb_id,
				media_type: sampleContent[3].media_type,
				status: 'watching',
			}),
			WatchlistEntry.create({
				user_id: userActive.user_id,
				tmdb_id: sampleContent[4].tmdb_id,
				media_type: sampleContent[4].media_type,
				status: 'finished',
				rating: 5,
			}),
			WatchlistEntry.create({
				user_id: userActive.user_id,
				tmdb_id: sampleContent[5].tmdb_id,
				media_type: sampleContent[5].media_type,
				status: 'watch_together_focused',
			}),

			// UserBanned's matching entries
			WatchlistEntry.create({
				user_id: userBanned.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'watch_together_focused',
			}),
			WatchlistEntry.create({
				user_id: userBanned.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'watching',
				rating: 5,
			}),
			WatchlistEntry.create({
				user_id: userBanned.user_id,
				tmdb_id: sampleContent[2].tmdb_id,
				media_type: sampleContent[2].media_type,
				status: 'watch_together_background',
			}),
			WatchlistEntry.create({
				user_id: userBanned.user_id,
				tmdb_id: sampleContent[3].tmdb_id,
				media_type: sampleContent[3].media_type,
				status: 'watching',
			}),
			WatchlistEntry.create({
				user_id: userBanned.user_id,
				tmdb_id: sampleContent[4].tmdb_id,
				media_type: sampleContent[4].media_type,
				status: 'finished',
				rating: 5,
			}),
			WatchlistEntry.create({
				user_id: userBanned.user_id,
				tmdb_id: sampleContent[5].tmdb_id,
				media_type: sampleContent[5].media_type,
				status: 'watch_together_background',
			}),

			// UserSuspended's unique entry
			WatchlistEntry.create({
				user_id: userSuspended.user_id,
				tmdb_id: sampleContent[6].tmdb_id,
				media_type: sampleContent[6].media_type,
				status: 'watch_together_focused',
			}),

			// Additional entries for new users
			// User1 entries
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'to_watch',
			}),
			WatchlistEntry.create({
				user_id: user1.user_id,
				tmdb_id: sampleContent[2].tmdb_id,
				media_type: sampleContent[2].media_type,
				status: 'watching',
				rating: 3,
			}),

			// User2 entries
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'to_watch',
			}),
			WatchlistEntry.create({
				user_id: user2.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'finished',
				rating: 4,
			}),

			// User3 entries
			WatchlistEntry.create({
				user_id: user3.user_id,
				tmdb_id: sampleContent[3].tmdb_id,
				media_type: sampleContent[3].media_type,
				status: 'watching',
			}),
			WatchlistEntry.create({
				user_id: user3.user_id,
				tmdb_id: sampleContent[4].tmdb_id,
				media_type: sampleContent[4].media_type,
				status: 'finished',
				rating: 5,
			}),

			// User5 entries
			WatchlistEntry.create({
				user_id: user5.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'watching',
				rating: 4,
			}),
			WatchlistEntry.create({
				user_id: user5.user_id,
				tmdb_id: sampleContent[5].tmdb_id,
				media_type: sampleContent[5].media_type,
				status: 'to_watch',
			}),

			// User6 entries
			WatchlistEntry.create({
				user_id: user6.user_id,
				tmdb_id: sampleContent[2].tmdb_id,
				media_type: sampleContent[2].media_type,
				status: 'watch_together_focused',
			}),
			WatchlistEntry.create({
				user_id: user6.user_id,
				tmdb_id: sampleContent[3].tmdb_id,
				media_type: sampleContent[3].media_type,
				status: 'finished',
				rating: 5,
			}),

			// User8 entries
			WatchlistEntry.create({
				user_id: user8.user_id,
				tmdb_id: sampleContent[0].tmdb_id,
				media_type: sampleContent[0].media_type,
				status: 'watch_together_background',
			}),
			WatchlistEntry.create({
				user_id: user8.user_id,
				tmdb_id: sampleContent[4].tmdb_id,
				media_type: sampleContent[4].media_type,
				status: 'watching',
			}),

			// User9 entries
			WatchlistEntry.create({
				user_id: user9.user_id,
				tmdb_id: sampleContent[1].tmdb_id,
				media_type: sampleContent[1].media_type,
				status: 'watch_together_focused',
			}),
			WatchlistEntry.create({
				user_id: user9.user_id,
				tmdb_id: sampleContent[5].tmdb_id,
				media_type: sampleContent[5].media_type,
				status: 'to_watch',
			}),
		]);

		// Create activity logs for users
		const pastDate = (daysAgo: number): Date => {
			const date = new Date();
			date.setDate(date.getDate() - daysAgo);
			return date;
		};

		// Activity logs for userActive
		await Promise.all([
			// Login activities
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(30),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(15),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(7),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(2),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(1),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: new Date(),
			}),

			// Profile updates
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_PROFILE_UPDATE,
				metadata: {
					changedFields: ['preferences.theme'],
					oldValue: 'light',
					newValue: 'dark',
				},
				created_at: pastDate(20),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.USER_PASSWORD_CHANGE,
				created_at: pastDate(10),
			}),

			// Watchlist activities
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[0].title,
					tmdb_id: sampleContent[0].tmdb_id,
					media_type: sampleContent[0].media_type,
				},
				created_at: pastDate(25),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[1].title,
					tmdb_id: sampleContent[1].tmdb_id,
					media_type: sampleContent[1].media_type,
				},
				created_at: pastDate(24),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
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
				user_id: userActive.user_id,
				action: ActivityType.WATCHLIST_RATE,
				metadata: {
					title: sampleContent[1].title,
					tmdb_id: sampleContent[1].tmdb_id,
					media_type: sampleContent[1].media_type,
					rating: 4,
				},
				created_at: pastDate(5),
			}),

			// Group activities
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.GROUP_CREATE,
				context: 'group',
				metadata: {
					group_id: group1.group_id,
					group_name: 'useractive & userbanned',
					group_type: 'couple',
				},
				created_at: pastDate(22),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: group1.group_id,
					group_name: 'useractive & userbanned',
				},
				created_at: pastDate(4),
			}),

			// Media search activity
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.MEDIA_SEARCH,
				metadata: {
					query: 'sci-fi movies',
					results_count: 15,
				},
				created_at: pastDate(3),
			}),
		]);

		// Activity logs for userBanned
		await Promise.all([
			// Login activities
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(28),
			}),
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(14),
			}),
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(6),
			}),
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(3),
			}),

			// Profile updates
			ActivityLog.create({
				user_id: userBanned.user_id,
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
				user_id: userBanned.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[0].title,
					tmdb_id: sampleContent[0].tmdb_id,
					media_type: sampleContent[0].media_type,
				},
				created_at: pastDate(26),
			}),
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[5].title,
					tmdb_id: sampleContent[5].tmdb_id,
					media_type: sampleContent[5].media_type,
				},
				created_at: pastDate(21),
			}),
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.WATCHLIST_RATE,
				metadata: {
					title: sampleContent[5].title,
					tmdb_id: sampleContent[5].tmdb_id,
					media_type: sampleContent[5].media_type,
					rating: 5,
				},
				created_at: pastDate(6),
			}),

			// Group activities
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: group1.group_id,
					group_name: 'useractive & userbanned',
					group_type: 'couple',
				},
				created_at: pastDate(20),
			}),

			// Media search activity
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.MEDIA_SEARCH,
				metadata: {
					query: 'fantasy tv shows',
					results_count: 12,
				},
				created_at: pastDate(2),
			}),
		]);

		// Activity logs for userSuspended
		await Promise.all([
			// Login activities
			ActivityLog.create({
				user_id: userSuspended.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(29),
			}),
			ActivityLog.create({
				user_id: userSuspended.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(15),
			}),
			ActivityLog.create({
				user_id: userSuspended.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(5),
			}),

			// Watchlist activities
			ActivityLog.create({
				user_id: userSuspended.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[6].title,
					tmdb_id: sampleContent[6].tmdb_id,
					media_type: sampleContent[6].media_type,
				},
				created_at: pastDate(10),
			}),
		]);

		// Activity logs for additional users
		await Promise.all([
			// User1 activities
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(12),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[0].title,
					tmdb_id: sampleContent[0].tmdb_id,
					media_type: sampleContent[0].media_type,
				},
				created_at: pastDate(8),
			}),
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.GROUP_CREATE,
				context: 'group',
				metadata: {
					group_id: group2.group_id,
					group_name: 'user1 & user2',
					group_type: 'couple',
				},
				created_at: pastDate(5),
			}),

			// User2 activities
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(11),
			}),
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[1].title,
					tmdb_id: sampleContent[1].tmdb_id,
					media_type: sampleContent[1].media_type,
				},
				created_at: pastDate(7),
			}),

			// User3 activities
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(10),
			}),
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[3].title,
					tmdb_id: sampleContent[3].tmdb_id,
					media_type: sampleContent[3].media_type,
				},
				created_at: pastDate(6),
			}),

			// User4 activities
			ActivityLog.create({
				user_id: user4.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(9),
			}),
			ActivityLog.create({
				user_id: user4.user_id,
				action: ActivityType.USER_PROFILE_UPDATE,
				metadata: {
					changedFields: ['preferences.theme'],
					oldValue: 'dark',
					newValue: 'light',
				},
				created_at: pastDate(4),
			}),

			// User5 activities
			ActivityLog.create({
				user_id: user5.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(8),
			}),
			ActivityLog.create({
				user_id: user5.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[1].title,
					tmdb_id: sampleContent[1].tmdb_id,
					media_type: sampleContent[1].media_type,
				},
				created_at: pastDate(5),
			}),

			// User6 activities
			ActivityLog.create({
				user_id: user6.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(7),
			}),
			ActivityLog.create({
				user_id: user6.user_id,
				action: ActivityType.WATCHLIST_RATE,
				metadata: {
					title: sampleContent[2].title,
					tmdb_id: sampleContent[2].tmdb_id,
					media_type: sampleContent[2].media_type,
					rating: 4,
				},
				created_at: pastDate(3),
			}),

			// User7 activities
			ActivityLog.create({
				user_id: user7.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(6),
			}),
			ActivityLog.create({
				user_id: user7.user_id,
				action: ActivityType.MEDIA_SEARCH,
				metadata: {
					query: 'horror movies',
					results_count: 8,
				},
				created_at: pastDate(2),
			}),

			// User8 activities
			ActivityLog.create({
				user_id: user8.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(5),
			}),
			ActivityLog.create({
				user_id: user8.user_id,
				action: ActivityType.WATCHLIST_ADD,
				metadata: {
					title: sampleContent[0].title,
					tmdb_id: sampleContent[0].tmdb_id,
					media_type: sampleContent[0].media_type,
				},
				created_at: pastDate(3),
			}),

			// User9 activities
			ActivityLog.create({
				user_id: user9.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(4),
			}),
			ActivityLog.create({
				user_id: user9.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: group5.group_id,
					group_name: 'user8 & user9',
					group_type: 'couple',
				},
				created_at: pastDate(2),
			}),

			// User10 activities
			ActivityLog.create({
				user_id: user10.user_id,
				action: ActivityType.USER_LOGIN,
				created_at: pastDate(3),
			}),
			ActivityLog.create({
				user_id: user10.user_id,
				action: ActivityType.USER_PROFILE_UPDATE,
				metadata: {
					changedFields: ['preferences.emailNotifications'],
					oldValue: true,
					newValue: false,
				},
				created_at: pastDate(1),
			}),
		]);

		// Group-related activities for the new complex groups
		await Promise.all([
			// Friend group creation and activities
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.GROUP_CREATE,
				context: 'group',
				metadata: {
					group_id: friendGroup.group_id,
					group_name: 'Movie Night Crew',
					group_type: 'friends',
				},
				created_at: pastDate(18),
			}),
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: friendGroup.group_id,
					group_name: 'Movie Night Crew',
					group_type: 'friends',
				},
				created_at: pastDate(17),
			}),
			ActivityLog.create({
				user_id: user5.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: friendGroup.group_id,
					group_name: 'Movie Night Crew',
					group_type: 'friends',
				},
				created_at: pastDate(16),
			}),

			// Watch party creation and activities
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.GROUP_CREATE,
				context: 'group',
				metadata: {
					group_id: watchPartyGroup.group_id,
					group_name: 'Sunday Binge Watchers',
					group_type: 'watch_party',
				},
				created_at: pastDate(12),
			}),
			ActivityLog.create({
				user_id: userActive.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: watchPartyGroup.group_id,
					group_name: 'Sunday Binge Watchers',
					group_type: 'watch_party',
				},
				created_at: pastDate(10),
			}),
			ActivityLog.create({
				user_id: user9.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: watchPartyGroup.group_id,
					group_name: 'Sunday Binge Watchers',
					group_type: 'watch_party',
				},
				created_at: pastDate(9),
			}),

			// College group activities
			ActivityLog.create({
				user_id: user5.user_id,
				action: ActivityType.GROUP_CREATE,
				context: 'group',
				metadata: {
					group_id: collegeGroup.group_id,
					group_name: 'College Alumni Watch Group',
					group_type: 'friends',
				},
				created_at: pastDate(14),
			}),
			ActivityLog.create({
				user_id: user6.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: collegeGroup.group_id,
					group_name: 'College Alumni Watch Group',
					group_type: 'friends',
				},
				created_at: pastDate(13),
			}),
			ActivityLog.create({
				user_id: userBanned.user_id,
				action: ActivityType.GROUP_JOIN,
				context: 'group',
				metadata: {
					group_id: collegeGroup.group_id,
					group_name: 'College Alumni Watch Group',
					group_type: 'friends',
				},
				created_at: pastDate(11),
			}),

			// Some group watchlist activities
			ActivityLog.create({
				user_id: user1.user_id,
				action: ActivityType.GROUP_WATCHLIST_ADD,
				context: 'group',
				metadata: {
					group_id: friendGroup.group_id,
					group_name: 'Movie Night Crew',
					title: sampleContent[0].title,
					tmdb_id: sampleContent[0].tmdb_id,
					media_type: sampleContent[0].media_type,
				},
				created_at: pastDate(8),
			}),
			ActivityLog.create({
				user_id: user3.user_id,
				action: ActivityType.GROUP_WATCHLIST_VOTE,
				context: 'group',
				metadata: {
					group_id: friendGroup.group_id,
					group_name: 'Movie Night Crew',
					title: sampleContent[0].title,
					vote: 'up',
				},
				created_at: pastDate(7),
			}),
			ActivityLog.create({
				user_id: user2.user_id,
				action: ActivityType.GROUP_SCHEDULE_SET,
				context: 'group',
				metadata: {
					group_id: watchPartyGroup.group_id,
					group_name: 'Sunday Binge Watchers',
					schedule: {
						day: 'sunday',
						time: '14:00',
					},
				},
				created_at: pastDate(6),
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

		const createdContent = await Promise.all(
			contentItems.map(item => Content.create(item))
		);

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
				user_id: userActive.user_id,
				reason: 'Inappropriate content',
				details: 'Contains excessive violence',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.breakingBad]!.id,
				user_id: userBanned.user_id,
				reason: 'Age rating concern',
				details: 'Content may not be suitable for the specified age group',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.inception]!.id,
				user_id: userActive.user_id,
				reason: 'Misleading description',
				details: 'Plot summary is inaccurate',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.inception]!.id,
				user_id: userSuspended.user_id,
				reason: 'Wrong categorization',
				details: 'Should be categorized as sci-fi',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.inception]!.id,
				user_id: userBanned.user_id,
				reason: 'Technical issue',
				details: 'Video playback issues',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.gameOfThrones]!.id,
				user_id: userActive.user_id,
				reason: 'Inappropriate content',
				details: 'Extremely graphic content',
				status: 'resolved' as const,
			},
			{
				content_id: createdContent[contentIndex.gameOfThrones]!.id,
				user_id: userBanned.user_id,
				reason: 'Age restriction',
				details: 'Content needs higher age rating',
				status: 'resolved' as const,
			},
			// Additional reports from new users
			{
				content_id: createdContent[contentIndex.matrix]!.id,
				user_id: user1.user_id,
				reason: 'Audio quality issue',
				details: 'Sound quality is poor in several scenes',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.strangerThings]!.id,
				user_id: user3.user_id,
				reason: 'Content warning needed',
				details: 'Should have stronger content warnings',
				status: 'pending' as const,
			},
			{
				content_id: createdContent[contentIndex.matrix]!.id,
				user_id: user7.user_id,
				reason: 'Subtitle issue',
				details: 'Subtitles are out of sync',
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

		console.warn('Database seeded successfully!');
		console.warn('');
		console.warn('Test accounts created:');
		console.warn('  useractive@example.com (verified, active)');
		console.warn('  userbanned@example.com (verified, banned)');
		console.warn('  usersuspended@example.com (unverified, suspended)');
		console.warn('  admin@example.com (verified, admin)');
		console.warn('');
		console.warn('Additional test users:');
		console.warn('  user1@example.com (verified, active)');
		console.warn('  user2@example.com (verified, active)');
		console.warn('  user3@example.com (unverified, active)');
		console.warn('  user4@example.com (verified, suspended)');
		console.warn('  user5@example.com (verified, active)');
		console.warn('  user6@example.com (verified, active)');
		console.warn('  user7@example.com (verified, banned)');
		console.warn('  user8@example.com (unverified, active)');
		console.warn('  user9@example.com (verified, active)');
		console.warn('  user10@example.com (verified, suspended)');
		console.warn('');
		console.warn('Groups created:');
		console.warn('  • 10 couple groups (2 members each)');
		console.warn('  • 1 friend group: "Movie Night Crew" (5 members)');
		console.warn('  • 1 watch party: "Sunday Binge Watchers" (6 members)');
		console.warn(
			'  • 1 college alumni group: "College Alumni Watch Group" (4 members)'
		);
		console.warn('');
		console.warn('Users with multiple relationships:');
		console.warn('  • userActive: 2 couples + 1 watch party');
		console.warn('  • user1: 1 couple + 1 friend group');
		console.warn('  • user3: 1 couple + 1 friend group');
		console.warn('  • user5: 1 couple + 2 friend groups');
		console.warn('  • user6: 1 couple + 2 friend groups');
		console.warn('  • user9: 1 couple + 1 college group + 1 watch party');
		console.warn('');
		console.warn('Email verification tokens:');
		console.warn('  usersuspended verification: sample-verification-token-123');
		console.warn('  useractive password reset: sample-reset-token-456');
		console.warn('');
		console.warn('Test the email flows:');
		console.warn('  - Visit /verify-email?token=sample-verification-token-123');
		console.warn('  - Visit /reset-password?token=sample-reset-token-456');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
}
