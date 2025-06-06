import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../../../__mocks__/mockTheme';
import { Link } from './Link';

const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Link Component', () => {
	describe('Basic Rendering', () => {
		it('renders with default props', () => {
			renderWithTheme(<Link href='#'>Test Link</Link>);
			expect(screen.getByText('Test Link')).toBeInTheDocument();
		});

		it('applies custom className', () => {
			renderWithTheme(
				<Link href='#' className='custom-link'>
					Test Link
				</Link>
			);
			expect(screen.getByText('Test Link')).toHaveClass('custom-link');
		});

		it('forwards ref correctly', () => {
			const ref = createRef<HTMLAnchorElement>();
			renderWithTheme(
				<Link ref={ref} href='#'>
					Test Link
				</Link>
			);
			expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
		});
	});

	describe('Variants and States', () => {
		it('renders primary variant correctly', () => {
			renderWithTheme(
				<Link href='#' variant='primary'>
					Primary Link
				</Link>
			);
			expect(screen.getByText('Primary Link')).toBeInTheDocument();
		});

		it('renders disabled state correctly', () => {
			renderWithTheme(
				<Link href='#' disabled>
					Disabled Link
				</Link>
			);
			const link = screen.getByText('Disabled Link');
			expect(link).toHaveAttribute('aria-disabled', 'true');
			expect(link).toHaveStyle({ pointerEvents: 'none' });
		});

		it('handles external links appropriately', () => {
			renderWithTheme(
				<Link href='https://example.com' external>
					External Link
				</Link>
			);
			const link = screen.getByText('External Link');
			expect(link).toHaveAttribute('rel', 'noopener noreferrer');
			expect(link).toHaveAttribute('target', '_blank');
		});
	});

	describe('Interaction Handling', () => {
		it('calls onClick handler when clicked', () => {
			const handleClick = jest.fn();
			renderWithTheme(
				<Link href='#' onClick={handleClick}>
					Clickable Link
				</Link>
			);

			fireEvent.click(screen.getByText('Clickable Link'));
			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it('does not call onClick when disabled', () => {
			const handleClick = jest.fn();
			renderWithTheme(
				<Link href='#' onClick={handleClick} disabled>
					Disabled Link
				</Link>
			);

			fireEvent.click(screen.getByText('Disabled Link'));
			expect(handleClick).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('has appropriate ARIA attributes', () => {
			renderWithTheme(
				<Link href='#' aria-label='Accessible Link'>
					Link Text
				</Link>
			);
			expect(screen.getByText('Link Text')).toHaveAttribute(
				'aria-label',
				'Accessible Link'
			);
		});

		it('supports keyboard navigation', () => {
			const handleClick = jest.fn();
			renderWithTheme(
				<Link href='#' onClick={handleClick}>
					Keyboard Link
				</Link>
			);

			const link = screen.getByText('Keyboard Link');
			link.focus();
			fireEvent.keyDown(link, { key: 'Enter' });
			expect(handleClick).toHaveBeenCalledTimes(1);
		});
	});
});
