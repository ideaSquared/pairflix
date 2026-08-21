import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from './useFocusTrap';

const Harness = ({
  isEnabled = true,
  onEscape,
}: {
  isEnabled?: boolean;
  onEscape?: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, isEnabled, onEscape);
  return (
    <div ref={containerRef}>
      <button type="button">First</button>
      <button type="button">Second</button>
      <button type="button">Third</button>
    </div>
  );
};

const OutsideHarness = ({ trapped }: { trapped: boolean }) => (
  <>
    <button type="button" data-testid="outside">
      Outside
    </button>
    {trapped ? <Harness /> : null}
  </>
);

describe('useFocusTrap', () => {
  it('wraps focus to the first element when Tab is pressed on the last', () => {
    render(<Harness />);

    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Third' });

    last.focus();
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(last, { key: 'Tab' });

    expect(document.activeElement).toBe(first);
  });

  it('wraps focus to the last element when Shift+Tab is pressed on the first', () => {
    render(<Harness />);

    const first = screen.getByRole('button', { name: 'First' });
    const last = screen.getByRole('button', { name: 'Third' });

    first.focus();
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(last);
  });

  it('invokes onEscape when Escape is pressed', () => {
    const onEscape = vi.fn();
    render(<Harness onEscape={onEscape} />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'First' }), {
      key: 'Escape',
    });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('restores focus to the previously-active element on unmount', () => {
    const { rerender } = render(<OutsideHarness trapped={false} />);

    const outside = screen.getByTestId('outside');
    outside.focus();
    expect(document.activeElement).toBe(outside);

    rerender(<OutsideHarness trapped={true} />);
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'First' })
    );

    rerender(<OutsideHarness trapped={false} />);
    expect(document.activeElement).toBe(outside);
  });
});
