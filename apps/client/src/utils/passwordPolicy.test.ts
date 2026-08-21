import { validatePassword, type PasswordPolicy } from './passwordPolicy';

const strictPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

describe('validatePassword', () => {
  it('accepts a password that satisfies every rule', () => {
    const result = validatePassword('Abcdefg1!', strictPolicy);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports only the length rule when the password is too short', () => {
    const result = validatePassword('Aa1!', strictPolicy);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'Password must be at least 8 characters long',
    ]);
  });

  it('reports the uppercase rule when no uppercase letter is present', () => {
    const result = validatePassword('abcdefg1!', strictPolicy);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'Password must contain at least one uppercase letter',
    ]);
  });

  it('reports the lowercase rule when no lowercase letter is present', () => {
    const result = validatePassword('ABCDEFG1!', strictPolicy);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'Password must contain at least one lowercase letter',
    ]);
  });

  it('reports the number rule when no digit is present', () => {
    const result = validatePassword('Abcdefg!', strictPolicy);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'Password must contain at least one number',
    ]);
  });

  it('reports the special character rule when no symbol is present', () => {
    const result = validatePassword('Abcdefg1', strictPolicy);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'Password must contain at least one special character',
    ]);
  });

  it('aggregates every failing rule at once', () => {
    const result = validatePassword('abc', strictPolicy);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual([
      'Password must be at least 8 characters long',
      'Password must contain at least one uppercase letter',
      'Password must contain at least one number',
      'Password must contain at least one special character',
    ]);
  });

  it('does not enforce rules that are disabled in the policy', () => {
    const lenientPolicy: PasswordPolicy = {
      minLength: 1,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    };

    const result = validatePassword('password', lenientPolicy);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
