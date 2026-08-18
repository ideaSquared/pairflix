import { fetchWithAuth } from './utils';

// requireAdmin (services/api/src/middleware/auth.ts) 403s every /api/admin/* route until the
// caller has TOTP enrolled -- these wrap the enrollment flow admins have to complete once, from
// account settings, before any admin route is reachable.
export const twoFactor = {
  enroll: async (): Promise<{ secret: string; otpauthUrl: string }> => {
    const response = await fetchWithAuth('/api/me/2fa/enroll', {
      method: 'POST',
    });
    return response.data;
  },

  verify: async (code: string): Promise<{ backupCodes: string[] }> => {
    const response = await fetchWithAuth('/api/me/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return response.data;
  },

  disable: async (currentPassword: string, code: string): Promise<void> => {
    await fetchWithAuth('/api/me/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, code }),
    });
  },
};
