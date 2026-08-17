import { fetchWithAuth } from './utils';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export const emailService = {
  /**
   * Request password reset email. Always reports success, regardless of
   * whether the address is registered.
   */
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<{ sent: boolean }> => {
    const response = await fetchWithAuth('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Reset password with token. Signs the caller into a new session on success.
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<{ id: string; email: string }> => {
    const response = await fetchWithAuth('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Resend the verification email by address. Registering doesn't start a
   * session, so a caller here has no session to resend a verification
   * email with -- always reports success, regardless of whether the
   * address is registered or already verified.
   */
  resendVerification: async (
    data: ResendVerificationRequest
  ): Promise<{ sent: boolean }> => {
    const response = await fetchWithAuth('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  /**
   * Verify email with token. Does not start a session.
   */
  verifyEmail: async (
    data: VerifyEmailRequest
  ): Promise<{ verified: boolean }> => {
    const response = await fetchWithAuth('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
