import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import { Switch } from './Switch';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);
};

describe('Switch', () => {
  describe('Basic Rendering', () => {
    it('renders correctly', () => {
      renderWithTheme(<Switch aria-label="test-switch" />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('renders with label', () => {
      renderWithTheme(<Switch label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Switch className="custom-switch" aria-label="test-switch" />
      );
      // The theme wrapper div render() adds is now the container's first
      // child, so find the Switch's own root (the <label>) via its input.
      expect(screen.getByRole('checkbox').closest('label')).toHaveClass(
        'custom-switch'
      );
    });
  });

  describe('State Management', () => {
    it('handles controlled state', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <Switch
          checked={true}
          onChange={handleChange}
          aria-label="test-switch"
        />
      );
      const switchInput = screen.getByRole('checkbox');
      expect(switchInput).toBeChecked();
    });

    it('handles uncontrolled state with defaultChecked', () => {
      renderWithTheme(<Switch defaultChecked aria-label="test-switch" />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('calls onChange handler', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <Switch onChange={handleChange} aria-label="test-switch" />
      );
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Disabled State', () => {
    it('renders in disabled state', () => {
      renderWithTheme(<Switch disabled aria-label="test-switch" />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('does not call onChange when disabled', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <Switch disabled onChange={handleChange} aria-label="test-switch" />
      );
      fireEvent.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      renderWithTheme(<Switch size="small" aria-label="test-switch" />);
      const switchElement = screen.getByRole('checkbox');
      expect(switchElement).toBeInTheDocument();
    });

    it('renders large size', () => {
      renderWithTheme(<Switch size="large" aria-label="test-switch" />);
      const switchElement = screen.getByRole('checkbox');
      expect(switchElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses label as aria-label when provided', () => {
      renderWithTheme(<Switch label="Test Label" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-label',
        'Test Label'
      );
    });

    it('uses explicit aria-label when provided', () => {
      renderWithTheme(<Switch aria-label="Custom Label" />);
      expect(screen.getByRole('checkbox')).toHaveAttribute(
        'aria-label',
        'Custom Label'
      );
    });

    it('is keyboard accessible', () => {
      const handleChange = jest.fn();
      renderWithTheme(
        <Switch onChange={handleChange} aria-label="test-switch" />
      );
      const switchElement = screen.getByRole('checkbox');
      switchElement.focus();
      fireEvent.keyDown(switchElement, { key: 'Enter', code: 'Enter' });
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
