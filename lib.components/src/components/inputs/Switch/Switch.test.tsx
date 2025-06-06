import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Switch } from './Switch';

const mockTheme = {
	colors: {
		primary: '#0077cc',
		text: {
			primary: '#000000',
		},
		border: {
			default: '#e0e0e0',
		},
	},
	spacing: {
		sm: '8px',
	},
	typography: {
		fontSize: {
			md: '16px',
		},
	},
};

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Switch', () => {
	describe('Basic Rendering', () => {
		it('renders correctly', () => {
			renderWithTheme(<Switch aria-label='test-switch' />);
			expect(screen.getByRole('checkbox')).toBeInTheDocument();
		});

		it('renders with label', () => {
			renderWithTheme(<Switch label='Test Label' />);
			expect(screen.getByText('Test Label')).toBeInTheDocument();
		});

		it('applies custom className', () => {
			const { container } = renderWithTheme(
				<Switch className='custom-switch' aria-label='test-switch' />
			);
			expect(container.firstChild).toHaveClass('custom-switch');
		});
	});

	describe('State Management', () => {
		it('handles controlled state', () => {
			const handleChange = jest.fn();
			renderWithTheme(
				<Switch
					checked={true}
					onChange={handleChange}
					aria-label='test-switch'
				/>
			);
			const switchInput = screen.getByRole('checkbox');
			expect(switchInput).toBeChecked();
		});

		it('handles uncontrolled state with defaultChecked', () => {
			renderWithTheme(<Switch defaultChecked aria-label='test-switch' />);
			expect(screen.getByRole('checkbox')).toBeChecked();
		});

		it('calls onChange handler', () => {
			const handleChange = jest.fn();
			renderWithTheme(
				<Switch onChange={handleChange} aria-label='test-switch' />
			);
			fireEvent.click(screen.getByRole('checkbox'));
			expect(handleChange).toHaveBeenCalledWith(true);
		});
	});

	describe('Disabled State', () => {
		it('renders in disabled state', () => {
			renderWithTheme(<Switch disabled aria-label='test-switch' />);
			expect(screen.getByRole('checkbox')).toBeDisabled();
		});

		it('does not call onChange when disabled', () => {
			const handleChange = jest.fn();
			renderWithTheme(
				<Switch disabled onChange={handleChange} aria-label='test-switch' />
			);
			fireEvent.click(screen.getByRole('checkbox'));
			expect(handleChange).not.toHaveBeenCalled();
		});
	});

	describe('Sizes', () => {
		it('renders small size', () => {
			renderWithTheme(<Switch size='small' aria-label='test-switch' />);
			const switchElement = screen.getByRole('checkbox');
			expect(switchElement).toBeInTheDocument();
		});

		it('renders large size', () => {
			renderWithTheme(<Switch size='large' aria-label='test-switch' />);
			const switchElement = screen.getByRole('checkbox');
			expect(switchElement).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('uses label as aria-label when provided', () => {
			renderWithTheme(<Switch label='Test Label' />);
			expect(screen.getByRole('checkbox')).toHaveAttribute(
				'aria-label',
				'Test Label'
			);
		});

		it('uses explicit aria-label when provided', () => {
			renderWithTheme(<Switch aria-label='Custom Label' />);
			expect(screen.getByRole('checkbox')).toHaveAttribute(
				'aria-label',
				'Custom Label'
			);
		});

		it('is keyboard accessible', () => {
			const handleChange = jest.fn();
			renderWithTheme(
				<Switch onChange={handleChange} aria-label='test-switch' />
			);
			const switchElement = screen.getByRole('checkbox');
			switchElement.focus();
			fireEvent.keyDown(switchElement, { key: 'Enter', code: 'Enter' });
			expect(handleChange).toHaveBeenCalled();
		});
	});
});
