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

export interface User {
	user_id: string;
	email: string;
	username: string;
	role: string;
	status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
	last_login?: Date;
	created_at: Date;
}

export interface WatchlistEntry {
	entry_id: string;
	user_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	status:
		| 'to_watch'
		| 'watch_together_focused'
		| 'watch_together_background'
		| 'watching'
		| 'finished'
		| 'flagged'
		| 'removed'
		| 'active';
	rating?: number;
	notes?: string;
	tags?: string[];
	created_at: Date;
	updated_at: Date;
	tmdb_status?: string;
	title?: string;
	overview?: string;
	poster_path?: string;
}

export interface Tag {
	tag_id: string;
	name: string;
}

export interface ActivityLog {
	log_id: string;
	user_id: string;
	action: string;
	metadata: Record<string, any>;
	created_at: Date;
}

import { Request } from 'express';

export interface AuthenticatedUser {
	user_id: string;
	email: string;
	username: string;
	role: string;
	status: 'active' | 'inactive' | 'pending' | 'suspended';
	preferences: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};
}

export interface AuthenticatedRequest extends Request {
	user?: AuthenticatedUser;
}

// Activity tracking metadata interfaces
export interface WatchlistActivityMetadata {
	mediaId: number;
	mediaType: 'movie' | 'tv';
	title: string;
	posterPath?: string;
	rating?: number; // for rating activities
	status?: string; // for status updates
	notes?: string; // for user notes
}

export interface MatchActivityMetadata {
	matchId: string;
	mediaId: number;
	mediaType: 'movie' | 'tv';
	title: string;
	partnerUserId: string;
	partnerUsername: string;
	status?: string; // match status
}

export interface SearchActivityMetadata {
	query: string;
	resultsCount: number;
	filters?: {
		mediaType?: string;
		genre?: string;
		year?: number;
		region?: string;
		language?: string;
	};
}

export interface UserActivityMetadata {
	previousValues?: Record<string, any>;
	newValues?: Record<string, any>;
	userAgent?: string;
	ipAddress?: string;
	sessionId?: string;
}

export interface MediaActivityMetadata {
	mediaId: number;
	mediaType: 'movie' | 'tv';
	title: string;
	actionType?: string; // viewed, favorited, shared, etc.
	duration?: number; // time spent viewing, in seconds
}

export type ActivityContext =
	| 'watchlist'
	| 'user'
	| 'match'
	| 'search'
	| 'media'
	| 'system';
