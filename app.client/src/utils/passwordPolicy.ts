import { AppSettings } from '../services/api';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a password against the configured password policy
 *
 * @param password The password to validate
 * @param policySettings The password policy settings from the application settings
 * @returns A validation result with isValid flag and any error messages
 */
export function validatePassword(
  password: string,
  policySettings: AppSettings['security']['passwordPolicy']
): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < policySettings.minLength) {
    errors.push(
      `Password must be at least ${policySettings.minLength} characters long`
    );
  }

  // Check uppercase requirement
  if (policySettings.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check lowercase requirement
  if (policySettings.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check numbers requirement
  if (policySettings.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check special characters requirement
  if (
    policySettings.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  ) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
