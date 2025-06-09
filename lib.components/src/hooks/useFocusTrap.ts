import { useCallback, useEffect } from 'react';

/**
 * Hook to trap focus within a container element
 * @param containerRef - Ref to the container element to trap focus within
 * @param isEnabled - Whether the focus trap is enabled
 * @param onEscape - Optional callback when escape key is pressed
 */
export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  isEnabled: boolean = true,
  onEscape?: () => void
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled || !containerRef.current) return;

      if (event.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements =
        containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      // If there are no focusable elements, do nothing
      if (!firstFocusableElement || !lastFocusableElement) return;

      // Shift + Tab
      if (event.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement.focus();
        }
        return;
      }

      // Tab
      if (document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    },
    [isEnabled, containerRef, onEscape]
  );

  useEffect(() => {
    if (!isEnabled) return;

    // Store the previous active element
    const previousActiveElement = document.activeElement;

    // Focus the first focusable element in the container
    if (containerRef.current) {
      const focusableElement = containerRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusableElement?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when the trap is disabled
      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [isEnabled, handleKeyDown]);
};

export default useFocusTrap;
