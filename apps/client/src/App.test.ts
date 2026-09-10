import { isClientError } from './App';
import { ApiError } from './services/api/utils';

describe('isClientError', () => {
  it('is true for a 4xx ApiError', () => {
    expect(isClientError(new ApiError('pick_quota_exceeded', 402))).toBe(true);
  });

  it('is true for a 401 ApiError', () => {
    expect(isClientError(new ApiError('Authentication required', 401))).toBe(
      true
    );
  });

  it('is false for a 5xx ApiError', () => {
    expect(isClientError(new ApiError('boom', 503))).toBe(false);
  });

  it('is false for a plain network Error', () => {
    expect(isClientError(new Error('Network error occurred'))).toBe(false);
  });
});
