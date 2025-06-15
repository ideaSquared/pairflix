// Group Types
export type GroupType = 'couple' | 'friends' | 'watch_party';
export type GroupStatus = 'active' | 'inactive' | 'archived';
export type MemberRole = 'owner' | 'admin' | 'member';
export type MemberStatus = 'pending' | 'active' | 'inactive' | 'removed';
export type GroupWatchlistStatus =
  | 'suggested'
  | 'voting'
  | 'approved'
  | 'watching'
  | 'finished'
  | 'rejected';

export interface GroupSettings {
  isPublic: boolean;
  requireApproval: boolean;
  allowInvites: boolean;
  scheduleSettings?: {
    recurringDay?: string; // 'monday', 'tuesday', etc.
    recurringTime?: string; // '19:00' format
  };
}

export interface Group {
  group_id: string;
  name: string;
  description?: string;
  type: GroupType;
  status: GroupStatus;
  created_by: string;
  max_members?: number;
  settings: GroupSettings;
  created_at: string;
  updated_at: string;
  // Relations populated by joins
  creator?: {
    user_id: string;
    username: string;
    email: string;
  };
  members?: GroupMember[];
  member_count?: number;
}

export interface GroupMember {
  membership_id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  joined_at: string;
  invited_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    user_id: string;
    username: string;
    email: string;
  };
  inviter?: {
    user_id: string;
    username: string;
    email: string;
  };
}

export interface GroupWatchlistEntry {
  group_entry_id: string;
  group_id: string;
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  status: GroupWatchlistStatus;
  suggested_by: string;
  votes_for: number;
  votes_against: number;
  notes?: string;
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  // Relations
  suggester?: {
    user_id: string;
    username: string;
    email: string;
  };
  // Content details from TMDB (populated by join or API call)
  content?: {
    title: string;
    poster_path?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
  };
}

// API Request/Response Types
export interface CreateGroupRequest {
  name: string;
  description?: string;
  type: GroupType;
  max_members?: number;
  settings?: Partial<GroupSettings>;
}

export interface CreateRelationshipRequest {
  partner_email: string;
  group_name: string;
  description?: string;
}

export interface InviteToGroupRequest {
  emails: string[];
}

export interface AddToGroupWatchlistRequest {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  notes?: string;
  scheduled_date?: string;
}

export interface GroupInvitation {
  group_id: string;
  group_name: string;
  invited_by: string;
  inviter_username: string;
  created_at: string;
}

export interface GroupContentMatch {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  match_score?: number;
  member_statuses: {
    user_id: string;
    username: string;
    status: string;
  }[];
}

// UI State Types
export interface GroupFilters {
  type?: GroupType;
  status?: GroupStatus;
  search?: string;
}

export interface GroupWatchlistFilters {
  status?: GroupWatchlistStatus;
  media_type?: 'movie' | 'tv';
  search?: string;
}
