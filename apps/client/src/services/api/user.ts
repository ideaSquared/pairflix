import { fetchWithAuth, type UserPreferences } from './utils';

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface EmailUpdate {
  email: string;
  password: string;
}

export const user = {
  updatePassword: async (data: PasswordUpdate): Promise<void> => {
    await fetchWithAuth('/api/me/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEmail: async (data: EmailUpdate): Promise<{ pending: boolean }> => {
    const response = await fetchWithAuth('/api/me/email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateUsername: async (data: {
    username: string;
  }): Promise<{ id: string; username: string }> => {
    const response = await fetchWithAuth('/api/me/username', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updatePreferences: async (
    preferences: Partial<UserPreferences>
  ): Promise<{ preferences: UserPreferences }> => {
    const response = await fetchWithAuth('/api/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ preferences }),
    });
    return response.data;
  },
};
