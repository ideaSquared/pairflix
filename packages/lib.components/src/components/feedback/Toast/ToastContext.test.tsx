import { act, fireEvent, render, screen } from '@testing-library/react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import { ToastProvider, useToast, type ToastOptions } from './ToastContext';

const Trigger = ({
  message,
  options,
}: {
  message: string;
  options?: ToastOptions;
}) => {
  const { addToast } = useToast();
  return (
    <button type="button" onClick={() => addToast(message, options)}>
      Add toast
    </button>
  );
};

const renderProvider = (ui: React.ReactElement) =>
  render(
    <div className={`${lightThemeClass} ${themeRoot}`}>
      <ToastProvider>{ui}</ToastProvider>
    </div>
  );

const addToast = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Add toast' }));

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders a toast with the given message when addToast is called', () => {
    renderProvider(<Trigger message="Hello toast" />);

    expect(screen.queryByText('Hello toast')).not.toBeInTheDocument();

    addToast();

    expect(screen.getByText('Hello toast')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('auto-removes the toast after its duration elapses', () => {
    renderProvider(
      <Trigger message="Temporary toast" options={{ duration: 1000 }} />
    );

    addToast();
    expect(screen.getByText('Temporary toast')).toBeInTheDocument();

    // Duration timer fires -> the toast begins its exit animation but is still mounted.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Temporary toast')).toBeInTheDocument();

    // Exit animation (300ms) completes -> onClose -> removeToast unmounts it.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText('Temporary toast')).not.toBeInTheDocument();
  });

  it('uses a default duration of 5000ms when none is provided', () => {
    renderProvider(<Trigger message="Default toast" />);

    addToast();
    expect(screen.getByText('Default toast')).toBeInTheDocument();

    // Still present well before the default 5000ms duration.
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText('Default toast')).toBeInTheDocument();

    // Past 5000ms + the 300ms exit animation -> removed.
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(screen.queryByText('Default toast')).not.toBeInTheDocument();
  });

  it('removes the toast when its close button is dismissed', () => {
    renderProvider(
      <Trigger message="Dismiss me" options={{ duration: 100000 }} />
    );

    addToast();
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });
});
