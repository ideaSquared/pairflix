/**
 * Enum for watchlist entry status values
 */
export enum WatchStatus {
	WANT_TO_WATCH = 'to_watch',
	WATCH_TOGETHER_FOCUSED = 'watch_together_focused',
	WATCH_TOGETHER_BACKGROUND = 'watch_together_background',
	WATCHING = 'watching',
	WATCHED = 'finished',
	FLAGGED = 'flagged',
	REMOVED = 'removed',
	ACTIVE = 'active',
}

/**
 * Enum for media type values
 */
export enum MediaType {
	MOVIE = 'movie',
	TV = 'tv',
}

/**
 * Enum for content status values
 */
export enum ContentStatus {
	ACTIVE = 'active',
	PENDING = 'pending',
	FLAGGED = 'flagged',
	REMOVED = 'removed',
}
