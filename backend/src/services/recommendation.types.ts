export type Mood =
	| 'funny'
	| 'dark'
	| 'feelgood'
	| 'tense'
	| 'romantic'
	| 'thoughtful'
	| 'action';

export interface TasteProfileWeights {
	genres: Record<string, number>;
	tone?: Record<string, number>;
	runtime_pref?: number;
}

export interface TasteProfileStub {
	user_id: string;
	weights: TasteProfileWeights;
	embedding?: number[] | null;
}

export interface HouseholdStub {
	household_id: string;
	member_ids: string[];
}

export interface WatchedTogetherStub {
	household_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	watched_at: Date;
	enjoyed?: boolean | null;
	mood_at_pick?: Mood | null;
	minutes_budget_at_pick?: number | null;
}

export interface ProviderEntry {
	provider_id: number;
	provider_name: string;
	logo_path?: string;
}

export interface WatchProvidersResult {
	flatrate?: ProviderEntry[];
	free?: ProviderEntry[];
	ads?: ProviderEntry[];
	buy?: ProviderEntry[];
	rent?: ProviderEntry[];
}

export interface RecommendationCard {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	title: string;
	year: number | null;
	runtime: number | null;
	overview: string;
	poster_path: string | null;
	providers: WatchProvidersResult;
}

export interface RecommendationResult {
	pick: RecommendationCard;
	alternates: RecommendationCard[];
	rationale: string;
	score: number;
}

export interface PickForHouseholdInput {
	householdId: string;
	mood: Mood;
	minutes: number;
	providers?: string[];
	region?: string;
	excludeTmdbIds?: number[];
}

export interface HouseholdRepository {
	getHousehold(householdId: string): Promise<HouseholdStub | null>;
	getMemberTasteProfiles(memberIds: string[]): Promise<TasteProfileStub[]>;
	getWatchedTogether(householdId: string): Promise<WatchedTogetherStub[]>;
	getFinishedTmdbIdsForMembers(memberIds: string[]): Promise<number[]>;
	recordWatchedTogether(
		row: Omit<WatchedTogetherStub, 'watched_at'> & { watched_at?: Date }
	): Promise<void>;
	isMember(householdId: string, userId: string): Promise<boolean>;
}
