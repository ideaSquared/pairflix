export interface User {
	user_id: string;
	email: string;
	username: string;
	role: string;
	status: 'active' | 'inactive' | 'pending' | 'suspended';
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
		| 'to_watch_together'
		| 'would_like_to_watch_together'
		| 'watching'
		| 'finished'
		| 'flagged'
		| 'removed'
		| 'active';
	rating?: number;
	notes?: string;
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
