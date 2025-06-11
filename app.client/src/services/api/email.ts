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

export interface EmailResponse {
  message: string;
}

export interface EmailVerificationResponse {
  message: string;
  token?: string;
  user?: {
    user_id: string;
    email: string;
    username: string;
    role: string;
    status: string;
    email_verified: boolean;
    preferences: Record<string, unknown>;
  };
}

export const emailService = {
  /**
   * Request password reset email
   */
  forgotPassword: async (
    data: ForgotPasswordRequest
  ): Promise<EmailResponse> => {
    return fetchWithAuth('/api/email/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<EmailResponse> => {
    return fetchWithAuth('/api/email/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Send email verification
   */
  sendEmailVerification: async (): Promise<EmailResponse> => {
    return fetchWithAuth('/api/email/send-verification', {
      method: 'POST',
    });
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (
    data: VerifyEmailRequest
  ): Promise<EmailVerificationResponse> => {
    return fetchWithAuth('/api/email/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
