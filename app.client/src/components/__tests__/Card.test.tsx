import { render, screen } from '../../tests/setup';
import { Card, CardContent, CardFooter, CardHeader } from '../common/Card';

describe('Card Components', () => {
	it('renders Card with content', () => {
		render(
			<Card>
				<div>Card content</div>
			</Card>
		);
		expect(screen.getByText('Card content')).toBeInTheDocument();
	});

	it('renders Card with header, content, and footer', () => {
		render(
			<Card>
				<CardHeader>Header</CardHeader>
				<CardContent>Content</CardContent>
				<CardFooter>Footer</CardFooter>
			</Card>
		);

		expect(screen.getByText('Header')).toBeInTheDocument();
		expect(screen.getByText('Content')).toBeInTheDocument();
		expect(screen.getByText('Footer')).toBeInTheDocument();
	});

	it('applies custom className to Card', () => {
		render(
			<Card className='custom-class'>
				<div>Content</div>
			</Card>
		);

		const card = screen.getByText('Content').parentElement;
		expect(card).toHaveClass('custom-class');
	});

	it('renders CardContent with no padding when specified', () => {
		render(
			<CardContent noPadding>
				<div>Content</div>
			</CardContent>
		);

		const content = screen.getByText('Content').parentElement;
		expect(content).toHaveStyle({ padding: '0' });
	});
});
