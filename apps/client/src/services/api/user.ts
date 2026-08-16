// filepath: c:\Users\thete\Desktop\localdev\pairflix\frontend\src\services\api\user.ts
import { fetchWithAuth } from './utils';

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface EmailUpdate {
  email: string;
  password: string;
}

export interface UpdateEmailResponse {
  message: string;
  user: {
    user_id: string;
    email: string;
    username: string;
  };
  token: string;
}

export interface UpdateUsernameResponse {
  message: string;
  user: {
    user_id: string;
    email: string;
    username: string;
  };
  token: string;
}

export const user = {
  updatePassword: async (data: PasswordUpdate) => {
    return fetchWithAuth('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateEmail: async (data: EmailUpdate): Promise<UpdateEmailResponse> => {
    return fetchWithAuth('/api/user/email', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateUsername: async (data: {
    username: string;
  }): Promise<UpdateUsernameResponse> => {
    return fetchWithAuth('/api/user/username', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  findByEmail: async (email: string) => {
    return fetchWithAuth(`/api/user/search?email=${encodeURIComponent(email)}`);
  },

  updatePreferences: async (preferences: {
    theme?: 'light' | 'dark';
    viewStyle?: 'list' | 'grid';
    emailNotifications?: boolean;
    autoArchiveDays?: number;
    favoriteGenres?: string[];
  }) => {
    return fetchWithAuth('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    });
  },
};
