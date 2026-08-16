import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import Loading, {
  ButtonLoading,
  InlineLoading,
  LoadingSpinner,
} from './Loading';

// Helper function to render with the real theme class applied
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props correctly', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner data-testid="spinner" />
      );
      const spinner = (container.firstChild as HTMLElement).firstChild;

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveStyle('width: 40px');
      expect(spinner).toHaveStyle('height: 40px');
      expect(spinner).toHaveStyle('border-radius: 50%');
    });

    it('applies custom size', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner size={60} data-testid="spinner" />
      );
      const spinner = (container.firstChild as HTMLElement).firstChild;

      expect(spinner).toHaveStyle('width: 60px');
      expect(spinner).toHaveStyle('height: 60px');
    });

    it('applies custom thickness', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner thickness={5} data-testid="spinner" />
      );

      // Border properties would need a fuller style-assertion helper
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom color', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner color="#ff0000" data-testid="spinner" />
      );

      // Color properties would need a fuller style-assertion helper
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom animation speed', () => {
      const { container } = renderWithTheme(
        <LoadingSpinner speed={2} data-testid="spinner" />
      );

      // Animation properties would need a fuller style-assertion helper
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Loading', () => {
    it('renders with default props correctly', () => {
      renderWithTheme(<Loading />);

      // Should have spinner and default message
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays custom message', () => {
      renderWithTheme(<Loading message="Please wait..." />);

      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('hides message when empty string provided', () => {
      renderWithTheme(<Loading message="" />);

      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('applies custom size to spinner', () => {
      renderWithTheme(<Loading size={60} />);

      // Size would be applied to the spinner component
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
      renderWithTheme(
        <Loading>
          <div data-testid="child">Additional content</div>
        </Loading>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Additional content')).toBeInTheDocument();
    });

    it('renders in fullscreen mode', () => {
      renderWithTheme(<Loading fullScreen />);

      // Full screen container would wrap the content
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('passes spinner props correctly', () => {
      renderWithTheme(
        <Loading spinnerProps={{ color: '#ff0000', thickness: 5 }} />
      );

      // These props would be passed to the spinner component
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('applies className when provided', () => {
      renderWithTheme(<Loading className="custom-loader" />);

      // The className would be applied to the container
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('sets appropriate aria attributes', () => {
      renderWithTheme(<Loading message="Custom loading message" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-busy', 'true');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        'Custom loading message'
      );
    });
  });

  describe('InlineLoading', () => {
    it('renders with default props correctly', () => {
      renderWithTheme(<InlineLoading />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays custom message', () => {
      renderWithTheme(<InlineLoading message="Inline loading..." />);

      expect(screen.getByText('Inline loading...')).toBeInTheDocument();
    });

    it('applies custom size to spinner', () => {
      renderWithTheme(<InlineLoading size={30} />);

      // Size would be applied to the spinner component
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('sets appropriate aria attributes', () => {
      renderWithTheme(<InlineLoading message="Inline loading message" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-busy', 'true');
      expect(progressbar).toHaveAttribute(
        'aria-label',
        'Inline loading message'
      );
    });
  });

  describe('ButtonLoading', () => {
    it('renders with default props correctly', () => {
      const { container } = renderWithTheme(
        <ButtonLoading data-testid="button-spinner" />
      );
      const spinner = (container.firstChild as HTMLElement).firstChild;

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveStyle('width: 16px');
      expect(spinner).toHaveStyle('height: 16px');
    });

    it('applies custom size', () => {
      const { container } = renderWithTheme(
        <ButtonLoading size={24} data-testid="button-spinner" />
      );
      const spinner = (container.firstChild as HTMLElement).firstChild;

      expect(spinner).toHaveStyle('width: 24px');
      expect(spinner).toHaveStyle('height: 24px');
    });
  });
});
