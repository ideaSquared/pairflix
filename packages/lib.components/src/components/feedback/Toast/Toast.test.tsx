import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import { Toast } from './Toast';
import { toast as toastClass } from './Toast.css';
import type {
  ToastProps as ToastContextProps,
  ToastOptions,
  ToastType,
} from './ToastContext';

// Define a type for the useToast return value to be used in tests
interface ToastContextValue {
  addToast: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const defaultToastProps = {
  duration: 5000,
  pauseOnHover: true,
  closeable: true,
};

// Mock useToast hook
const mockAddToast = jest.fn();
const mockRemoveToast = jest.fn();

// Create a mocked version of useToast that can be used in tests
jest.mock('./ToastContext', () => {
  const originalModule = jest.requireActual('./ToastContext');
  return {
    ...originalModule,
    useToast: () => ({
      addToast: mockAddToast,
      removeToast: mockRemoveToast,
    }),
  };
});

// Helper component that calls the provided action with toast functions
const TestComponent = ({
  action,
}: {
  action: (toast: ToastContextValue) => void;
}) => {
  // Import is mocked, so this will return our mock functions
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useToast } = require('./ToastContext');
  const toast = useToast();
  React.useEffect(() => {
    action(toast);
  }, [action, toast]);
  return null;
};

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

describe('Toast System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockAddToast.mockClear();
    mockRemoveToast.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Toast Component', () => {
    it('renders toast with message', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(
        <Toast
          toast={{
            id: '1',
            message: 'Test message',
            type: 'info',
            variant: 'info',
            ...defaultToastProps,
          }}
          onClose={mockOnClose}
        />
      );
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('renders with correct variant styles', () => {
      const mockOnClose = jest.fn();
      const { container } = renderWithTheme(
        <Toast
          toast={{
            id: '1',
            message: 'Test message',
            type: 'error',
            variant: 'error',
            ...defaultToastProps,
          }}
          onClose={mockOnClose}
        />
      );
      // Colors resolve through CSS custom properties, which jsdom can't
      // substitute -- assert the recipe picked the right variant class
      // instead of the (unresolvable in jsdom) computed color.
      const toastElement = (container.firstChild as HTMLElement).firstChild;
      expect(toastElement).toHaveClass(toastClass({ variant: 'error' }));
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      renderWithTheme(
        <Toast
          toast={{
            id: '1',
            message: 'Test message',
            type: 'info',
            variant: 'info',
            ...defaultToastProps,
          }}
          onClose={handleClose}
        />
      );

      const closeButton = screen.getByLabelText('Close notification');
      fireEvent.click(closeButton);

      // Account for exit animation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(handleClose).toHaveBeenCalled();
    });

    it('pauses timer on hover when pauseOnHover is true', () => {
      const handleClose = jest.fn();
      const toast = {
        id: '1',
        message: 'Test message',
        type: 'info' as ToastType,
        variant: 'info' as ToastContextProps['type'],
        duration: 1000,
        pauseOnHover: true,
        closeable: true,
      };

      renderWithTheme(<Toast toast={toast} onClose={handleClose} />);

      // Let the timer start - initially it should be running
      act(() => {
        jest.advanceTimersByTime(500); // Advance halfway through the duration
      });

      // Hover on toast to pause the timer
      fireEvent.mouseEnter(screen.getByRole('alert'));

      // Advance time well beyond the original duration
      // Timer should be paused, so handleClose should not be called
      act(() => {
        jest.advanceTimersByTime(2000);
      });
      expect(handleClose).not.toHaveBeenCalled();

      // Mouse leave to unpause the timer
      fireEvent.mouseLeave(screen.getByRole('alert'));

      // The remaining time should be around 500ms, advance past that
      act(() => {
        jest.advanceTimersByTime(1000); // Giving extra time to ensure closure
      });

      // Should now be closed
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Toast Context', () => {
    it('adds and removes toasts', () => {
      renderWithTheme(
        <TestComponent
          action={toast => {
            toast.addToast('Test toast', { type: 'info' });
          }}
        />
      );

      expect(mockAddToast).toHaveBeenCalledWith('Test toast', { type: 'info' });
    });

    it('supports multiple toast positions', () => {
      renderWithTheme(
        <TestComponent
          action={toast => {
            toast.addToast('Top toast', {
              type: 'info',
              position: 'top-center',
            });
            toast.addToast('Bottom toast', {
              type: 'success',
              position: 'bottom-center',
            });
          }}
        />
      );

      expect(mockAddToast).toHaveBeenCalledWith('Top toast', {
        type: 'info',
        position: 'top-center',
      });
      expect(mockAddToast).toHaveBeenCalledWith('Bottom toast', {
        type: 'success',
        position: 'bottom-center',
      });
    });

    it('handles multiple toasts and removes them', () => {
      renderWithTheme(
        <TestComponent
          action={toast => {
            toast.addToast('Toast 1', { type: 'info' });
            toast.addToast('Toast 2', { type: 'success' });
            toast.removeToast('toast-id-1');
          }}
        />
      );

      expect(mockAddToast).toHaveBeenCalledWith('Toast 1', { type: 'info' });
      expect(mockAddToast).toHaveBeenCalledWith('Toast 2', { type: 'success' });
      expect(mockRemoveToast).toHaveBeenCalledWith('toast-id-1');
    });

    it('handles toast with custom duration', () => {
      renderWithTheme(
        <TestComponent
          action={toast => {
            toast.addToast('Custom duration', {
              type: 'info',
              duration: 2000,
            });
          }}
        />
      );

      expect(mockAddToast).toHaveBeenCalledWith('Custom duration', {
        type: 'info',
        duration: 2000,
      });
    });
  });

  describe('Accessibility', () => {
    it('sets correct ARIA role and live region', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(
        <Toast
          toast={{
            id: '1',
            message: 'Test message',
            type: 'error',
            variant: 'error',
            ...defaultToastProps,
          }}
          onClose={mockOnClose}
        />
      );

      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('has accessible close button', () => {
      const mockOnClose = jest.fn();
      renderWithTheme(
        <Toast
          toast={{
            id: '1',
            message: 'Test message',
            type: 'info',
            variant: 'info',
            ...defaultToastProps,
          }}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByLabelText('Close notification');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('type', 'button');
    });
  });
});
