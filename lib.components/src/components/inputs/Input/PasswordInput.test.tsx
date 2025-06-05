import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import { PasswordInput } from './PasswordInput';

// Helper to render components with theme
const renderWithTheme = (component: React.ReactNode) => {
	return render(<ThemeProvider theme={lightTheme}>{component}</ThemeProvider>);
};

describe('PasswordInput Component', () => {
	// Basic rendering
	it('renders password input with masked value by default', () => {
		// Arrange & Act
		renderWithTheme(
			<PasswordInput
				label='Password'
				placeholder='Enter password'
				data-testid='password-input'
			/>
		);

		// Assert
		const input = screen.getByTestId('password-input');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'password');
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
	});

	// Toggle visibility
	it('toggles password visibility when clicked', async () => {
		// Arrange
		renderWithTheme(
			<PasswordInput label='Password' data-testid='password-input' />
		);

		// Act - Find and click the toggle button
		const toggleButton = screen.getByRole('button', { name: /show password/i });
		await userEvent.click(toggleButton);

		// Assert - Password should be visible
		const input = screen.getByTestId('password-input');
		expect(input).toHaveAttribute('type', 'text');
		expect(toggleButton).toHaveAccessibleName(/hide password/i);

		// Act - Click again to hide
		await userEvent.click(toggleButton);

		// Assert - Password should be hidden again
		expect(input).toHaveAttribute('type', 'password');
		expect(toggleButton).toHaveAccessibleName(/show password/i);
	});

	// Toggle visibility hidden
	it('does not show toggle button when showToggle is false', () => {
		// Arrange & Act
		renderWithTheme(
			<PasswordInput
				label='Password'
				showToggle={false}
				data-testid='password-input'
			/>
		);

		// Assert
		expect(
			screen.queryByRole('button', { name: /show password/i })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: /hide password/i })
		).not.toBeInTheDocument();
	});

	// Custom icons
	it('renders custom show/hide icons when provided', async () => {
		// Arrange
		renderWithTheme(
			<PasswordInput
				label='Password'
				showIcon={<span data-testid='custom-show-icon'>SHOW</span>}
				hideIcon={<span data-testid='custom-hide-icon'>HIDE</span>}
				data-testid='password-input'
			/>
		);

		// Assert - Should show the hide icon initially
		expect(screen.getByTestId('custom-hide-icon')).toBeInTheDocument();
		expect(screen.queryByTestId('custom-show-icon')).not.toBeInTheDocument();

		// Act - Toggle visibility
		const toggleButton = screen.getByRole('button', { name: /show password/i });
		await userEvent.click(toggleButton);

		// Assert - Should show the show icon
		expect(screen.getByTestId('custom-show-icon')).toBeInTheDocument();
		expect(screen.queryByTestId('custom-hide-icon')).not.toBeInTheDocument();
	});

	// Inheritance of Input props
	it('inherits properties from base Input component', () => {
		// Arrange & Act
		renderWithTheme(
			<PasswordInput
				label='Password'
				isInvalid
				helperText='Password is required'
				required
				isFullWidth
				data-testid='password-input'
			/>
		);

		// Assert
		const input = screen.getByTestId('password-input');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-required', 'true');
		expect(input).toHaveAttribute('required');
		expect(screen.getByText('Password is required')).toBeInTheDocument();
	});

	// User interaction - typing
	it('handles user input correctly', async () => {
		// Arrange
		const onChange = jest.fn();
		renderWithTheme(
			<PasswordInput data-testid='password-input' onChange={onChange} />
		);

		// Act
		const input = screen.getByTestId('password-input');
		await userEvent.type(input, 'secretpass');

		// Assert
		expect(onChange).toHaveBeenCalledTimes(10); // Once for each character
		expect(input).toHaveValue('secretpass');
	});

	// End adornment with toggle
	it('uses provided endAdornment when showToggle is false', () => {
		// Arrange & Act
		renderWithTheme(
			<PasswordInput
				showToggle={false}
				endAdornment={<span data-testid='custom-end-icon'>🔒</span>}
				data-testid='password-input'
			/>
		);

		// Assert
		expect(screen.getByTestId('custom-end-icon')).toBeInTheDocument();
	});

	// Accessibility for toggle button
	it('has accessible toggle button', () => {
		// Arrange & Act
		renderWithTheme(
			<PasswordInput label='Password' data-testid='password-input' />
		);

		// Assert
		const toggleButton = screen.getByRole('button');
		expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
		expect(toggleButton).toHaveAttribute('type', 'button'); // Prevent form submission
	});
});
