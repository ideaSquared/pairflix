import { render } from '@testing-library/react';
import { SessionManager } from './SessionManager';

// Mock timers
jest.useFakeTimers();

describe('SessionManager', () => {
  let mockOnSessionExpire: jest.Mock;

  beforeEach(() => {
    mockOnSessionExpire = jest.fn();
    jest.clearAllTimers();
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(global, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
  });

  it('renders without crashing', () => {
    render(
      <SessionManager
        sessionTimeout={30}
        onSessionExpire={mockOnSessionExpire}
      />
    );
  });

  it('does not start timer when sessionTimeout is not provided', () => {
    render(<SessionManager onSessionExpire={mockOnSessionExpire} />);

    expect(window.addEventListener).not.toHaveBeenCalled();
  });

  it('sets up activity event listeners when sessionTimeout is provided', () => {
    render(
      <SessionManager
        sessionTimeout={30}
        onSessionExpire={mockOnSessionExpire}
      />
    );

    expect(window.addEventListener).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
      { passive: true }
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
      { passive: true }
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'keypress',
      expect.any(Function),
      { passive: true }
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
      { passive: true }
    );
  });

  it('calls onSessionExpire when timeout is reached', () => {
    render(
      <SessionManager
        sessionTimeout={1} // 1 minute
        onSessionExpire={mockOnSessionExpire}
      />
    );

    // Fast forward by 1 minute (60000 ms)
    jest.advanceTimersByTime(60000);

    expect(mockOnSessionExpire).toHaveBeenCalledTimes(1);
  });

  it('shows alert by default when session expires', () => {
    const alertSpy = jest.spyOn(global, 'alert');

    render(
      <SessionManager
        sessionTimeout={1}
        onSessionExpire={mockOnSessionExpire}
      />
    );

    jest.advanceTimersByTime(60000);

    expect(alertSpy).toHaveBeenCalledWith(
      'Your session has expired due to inactivity. Please log in again.'
    );
  });

  it('shows custom message when provided', () => {
    const alertSpy = jest.spyOn(global, 'alert');
    const customMessage = 'Custom expiry message';

    render(
      <SessionManager
        sessionTimeout={1}
        onSessionExpire={mockOnSessionExpire}
        expireMessage={customMessage}
      />
    );

    jest.advanceTimersByTime(60000);

    expect(alertSpy).toHaveBeenCalledWith(customMessage);
  });

  it('does not show alert when showAlert is false', () => {
    const alertSpy = jest.spyOn(global, 'alert');

    render(
      <SessionManager
        sessionTimeout={1}
        onSessionExpire={mockOnSessionExpire}
        showAlert={false}
      />
    );

    jest.advanceTimersByTime(60000);

    expect(alertSpy).not.toHaveBeenCalled();
    expect(mockOnSessionExpire).toHaveBeenCalledTimes(1);
  });

  it('resets timer on user activity', () => {
    render(
      <SessionManager
        sessionTimeout={2} // 2 minutes
        onSessionExpire={mockOnSessionExpire}
      />
    );

    // Advance by 1 minute (not enough to expire)
    jest.advanceTimersByTime(60000);
    expect(mockOnSessionExpire).not.toHaveBeenCalled();

    // Simulate user activity (mousedown)
    const mouseEvent = new Event('mousedown');
    window.dispatchEvent(mouseEvent);

    // Advance by another minute (should still not expire as timer reset)
    jest.advanceTimersByTime(60000);
    expect(mockOnSessionExpire).not.toHaveBeenCalled();

    // Advance by another minute (now should expire)
    jest.advanceTimersByTime(60000);
    expect(mockOnSessionExpire).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <SessionManager
        sessionTimeout={30}
        onSessionExpire={mockOnSessionExpire}
      />
    );

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'keypress',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function)
    );
  });

  it('clears timer on unmount', () => {
    const { unmount } = render(
      <SessionManager
        sessionTimeout={30}
        onSessionExpire={mockOnSessionExpire}
      />
    );

    unmount();

    // Advance timers after unmount - should not call onSessionExpire
    jest.advanceTimersByTime(30 * 60 * 1000);
    expect(mockOnSessionExpire).not.toHaveBeenCalled();
  });
});
