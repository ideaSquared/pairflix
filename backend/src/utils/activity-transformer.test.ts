// filepath: c:\Users\thete\Desktop\localdev\pairflix\backend\src\utils\activity-transformer.test.ts
import { ActivityType } from '../services/activity.service';
import { transformActivity } from './activity-transformer';

describe('Activity Transformer Utility', () => {
	it('should transform WATCHLIST_ADD activity correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:00:00Z');
		const activity = {
			log_id: 'activity-1',
			user_id: 'user-123',
			action: ActivityType.WATCHLIST_ADD,
			metadata: { title: 'Inception', tmdb_id: 12345, media_type: 'movie' },
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-1',
			userId: 'user-123',
			username: 'moviefan',
			message: 'added "Inception" to their watchlist',
			type: ActivityType.WATCHLIST_ADD,
			timestamp: timestamp,
			metadata: { title: 'Inception', tmdb_id: 12345, media_type: 'movie' },
		});
	});

	it('should transform WATCHLIST_UPDATE activity correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:05:00Z');
		const activity = {
			log_id: 'activity-2',
			user_id: 'user-123',
			action: ActivityType.WATCHLIST_UPDATE,
			metadata: {
				title: 'Inception',
				tmdb_id: 12345,
				media_type: 'movie',
				status: 'finished',
			},
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-2',
			userId: 'user-123',
			username: 'moviefan',
			message: 'marked "Inception" as finished',
			type: ActivityType.WATCHLIST_UPDATE,
			timestamp: timestamp,
			metadata: {
				title: 'Inception',
				tmdb_id: 12345,
				media_type: 'movie',
				status: 'finished',
			},
		});
	});

	it('should transform WATCHLIST_REMOVE activity correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:10:00Z');
		const activity = {
			log_id: 'activity-3',
			user_id: 'user-123',
			action: ActivityType.WATCHLIST_REMOVE,
			metadata: { title: 'Inception', tmdb_id: 12345, media_type: 'movie' },
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-3',
			userId: 'user-123',
			username: 'moviefan',
			message: 'removed "Inception" from their watchlist',
			type: ActivityType.WATCHLIST_REMOVE,
			timestamp: timestamp,
			metadata: { title: 'Inception', tmdb_id: 12345, media_type: 'movie' },
		});
	});

	it('should transform WATCHLIST_RATE activity correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:15:00Z');
		const activity = {
			log_id: 'activity-4',
			user_id: 'user-123',
			action: ActivityType.WATCHLIST_RATE,
			metadata: { title: 'Inception', tmdb_id: 12345, rating: 8 },
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-4',
			userId: 'user-123',
			username: 'moviefan',
			message: 'rated "Inception" 8/10',
			type: ActivityType.WATCHLIST_RATE,
			timestamp: timestamp,
			metadata: { title: 'Inception', tmdb_id: 12345, rating: 8 },
		});
	});

	it('should transform USER_PROFILE_UPDATE for username change correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:20:00Z');
		const activity = {
			log_id: 'activity-5',
			user_id: 'user-123',
			action: ActivityType.USER_PROFILE_UPDATE,
			metadata: { field: 'username', newUsername: 'film_lover' },
			created_at: timestamp,
			user: { username: 'film_lover' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-5',
			userId: 'user-123',
			username: 'film_lover',
			message: 'changed their username to film_lover',
			type: ActivityType.USER_PROFILE_UPDATE,
			timestamp: timestamp,
			metadata: { field: 'username', newUsername: 'film_lover' },
		});
	});

	it('should transform USER_PROFILE_UPDATE for genre preferences correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:25:00Z');
		const activity = {
			log_id: 'activity-6',
			user_id: 'user-123',
			action: ActivityType.USER_PROFILE_UPDATE,
			metadata: {
				field: 'favoriteGenres',
				genres: ['Action', 'Sci-Fi', 'Drama'],
			},
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-6',
			userId: 'user-123',
			username: 'moviefan',
			message: 'updated their favorite genres to Action, Sci-Fi, Drama',
			type: ActivityType.USER_PROFILE_UPDATE,
			timestamp: timestamp,
			metadata: {
				field: 'favoriteGenres',
				genres: ['Action', 'Sci-Fi', 'Drama'],
			},
		});
	});

	it('should transform MATCH_CREATE activity correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:30:00Z');
		const activity = {
			log_id: 'activity-7',
			user_id: 'user-123',
			action: ActivityType.MATCH_CREATE,
			metadata: { matchId: 'match-1', contentIds: [1234, 5678] },
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-7',
			userId: 'user-123',
			username: 'moviefan',
			message: 'created a new match',
			type: ActivityType.MATCH_CREATE,
			timestamp: timestamp,
			metadata: { matchId: 'match-1', contentIds: [1234, 5678] },
		});
	});

	it('should transform MATCH_UPDATE activity correctly', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:35:00Z');
		const activity = {
			log_id: 'activity-8',
			user_id: 'user-123',
			action: ActivityType.MATCH_UPDATE,
			metadata: { matchId: 'match-1', newStatus: 'scheduled' },
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-8',
			userId: 'user-123',
			username: 'moviefan',
			message: 'updated a match status to scheduled',
			type: ActivityType.MATCH_UPDATE,
			timestamp: timestamp,
			metadata: { matchId: 'match-1', newStatus: 'scheduled' },
		});
	});

	it('should handle unknown activity types with a default message', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:40:00Z');
		const activity = {
			log_id: 'activity-9',
			user_id: 'user-123',
			action: 'UNKNOWN_TYPE' as any,
			metadata: { someData: 'value' },
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed).toEqual({
			id: 'activity-9',
			userId: 'user-123',
			username: 'moviefan',
			message: 'performed an action',
			type: 'UNKNOWN_TYPE',
			timestamp: timestamp,
			metadata: { someData: 'value' },
		});
	});

	it('should handle missing title in watchlist activities', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:45:00Z');
		const activity = {
			log_id: 'activity-10',
			user_id: 'user-123',
			action: ActivityType.WATCHLIST_ADD,
			metadata: { tmdb_id: 12345, media_type: 'movie' }, // No title
			created_at: timestamp,
			user: { username: 'moviefan' },
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed.message).toBe('added "a title" to their watchlist');
	});

	it('should handle missing user information', () => {
		// Arrange
		const timestamp = new Date('2025-05-29T12:50:00Z');
		const activity = {
			log_id: 'activity-11',
			user_id: 'user-123',
			action: ActivityType.WATCHLIST_ADD,
			metadata: { title: 'Inception', tmdb_id: 12345 },
			created_at: timestamp,
			// No user object
		};

		// Act
		const transformed = transformActivity(activity as any);

		// Assert
		expect(transformed.username).toBeUndefined();
		expect(transformed.message).toBe('added "Inception" to their watchlist');
	});
});
