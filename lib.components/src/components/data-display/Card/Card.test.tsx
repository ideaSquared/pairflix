// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\data-display\Card\Card.test.tsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../../../__mocks__/mockTheme';
import Card from './Card';

// Test rendering with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Card', () => {
	describe('Standard Card', () => {
		it('renders children content', () => {
			renderWithTheme(
				<Card>
					<div data-testid='card-content'>Card Content</div>
				</Card>
			);

			expect(screen.getByTestId('card-content')).toBeInTheDocument();
			expect(screen.getByText('Card Content')).toBeInTheDocument();
		});

		it('applies correct styles for primary variant', () => {
			const { container } = renderWithTheme(
				<Card variant='primary' data-testid='primary-card'>
					Primary Card
				</Card>
			);

			const card = container.firstChild;
			expect(card).toHaveStyle(
				`background-color: ${mockTheme.colors.background.secondary}`
			);
			expect(card).toHaveStyle(
				`border-left: 4px solid ${mockTheme.colors.primary}`
			);
		});

		it('applies correct styles for secondary variant', () => {
			const { container } = renderWithTheme(
				<Card variant='secondary' data-testid='secondary-card'>
					Secondary Card
				</Card>
			);

			const card = container.firstChild;
			expect(card).toHaveStyle(
				`background-color: ${mockTheme.colors.background.secondary}`
			);
			expect(card).toHaveStyle(
				`border: 1px solid ${mockTheme.colors.border.default}`
			);
		});

		it('applies correct styles for outlined variant', () => {
			const { container } = renderWithTheme(
				<Card variant='outlined' data-testid='outlined-card'>
					Outlined Card
				</Card>
			);

			const card = container.firstChild;
			// Browser normalizes transparent to rgba(0, 0, 0, 0)
			expect(card).toHaveStyle('background-color: rgba(0, 0, 0, 0)');
			expect(card).toHaveStyle(
				`border: 1px solid ${mockTheme.colors.border.default}`
			);
		});

		it('applies custom accent color when provided', () => {
			const customColor = '#ff0000';
			const { container } = renderWithTheme(
				<Card
					variant='primary'
					accentColor={customColor}
					data-testid='accent-card'
				>
					Accent Card
				</Card>
			);

			const card = container.firstChild;
			expect(card).toHaveStyle(`border-left: 4px solid ${customColor}`);
		});

		it('applies different elevation styles', () => {
			const { container, rerender } = renderWithTheme(
				<Card elevation='low' data-testid='low-card'>
					Low Elevation Card
				</Card>
			);

			let card = container.firstChild;
			// Browser normalizes rgba without spaces
			expect(card).toHaveStyle('box-shadow: 0 2px 4px rgba(0,0,0,0.1)');

			rerender(
				<ThemeProvider theme={mockTheme}>
					<Card elevation='medium' data-testid='medium-card'>
						Medium Elevation Card
					</Card>
				</ThemeProvider>
			);

			card = container.firstChild;
			expect(card).toHaveStyle('box-shadow: 0 4px 8px rgba(0,0,0,0.15)');

			rerender(
				<ThemeProvider theme={mockTheme}>
					<Card elevation='high' data-testid='high-card'>
						High Elevation Card
					</Card>
				</ThemeProvider>
			);

			card = container.firstChild;
			expect(card).toHaveStyle('box-shadow: 0 8px 16px rgba(0,0,0,0.2)');
		});

		it('adds interactive styles when isInteractive is true', () => {
			const { container } = renderWithTheme(
				<Card isInteractive data-testid='interactive-card'>
					Interactive Card
				</Card>
			);

			const card = container.firstChild;
			expect(card).toHaveStyle('cursor: pointer');
		});

		it('forwards ref correctly', () => {
			const ref = createRef<HTMLDivElement>();
			renderWithTheme(
				<Card ref={ref} data-testid='ref-card'>
					Card with Ref
				</Card>
			);

			expect(ref.current).not.toBeNull();
			expect(ref.current?.tagName).toBe('DIV');
		});
	});

	describe('Stats Card', () => {
		it('renders title and value', () => {
			renderWithTheme(<Card variant='stats' title='Revenue' value='$1,234' />);

			expect(screen.getByText('Revenue')).toBeInTheDocument();
			expect(screen.getByText('$1,234')).toBeInTheDocument();
		});

		it('formats numeric values with locale string', () => {
			renderWithTheme(<Card variant='stats' title='Users' value={1234567} />);

			expect(screen.getByText('1,234,567')).toBeInTheDocument();
		});

		it('displays caption when provided', () => {
			renderWithTheme(
				<Card
					variant='stats'
					title='Growth'
					value='23%'
					caption='Month over month'
				/>
			);

			expect(screen.getByText('Growth')).toBeInTheDocument();
			expect(screen.getByText('23%')).toBeInTheDocument();
			expect(screen.getByText('Month over month')).toBeInTheDocument();
		});

		it('applies custom value color when specified', () => {
			const valueColor = '#00ff00';
			renderWithTheme(
				<Card
					variant='stats'
					title='Profit'
					value='+15%'
					valueColor={valueColor}
				/>
			);

			const valueElement = screen.getByText('+15%');
			expect(valueElement).toHaveStyle(`color: ${valueColor}`);
		});
	});
});
