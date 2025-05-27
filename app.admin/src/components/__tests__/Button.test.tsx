import { fireEvent, render, screen } from '../../tests/setup';
import { Button } from '../common/Button';

describe('Button', () => {
	it('renders with default props', () => {
		render(<Button>Click me</Button>);
		const button = screen.getByText('Click me');
		expect(button).toBeInTheDocument();
		expect(button).toHaveStyle({ cursor: 'pointer' });
	});

	it('handles click events', () => {
		const handleClick = jest.fn();
		render(<Button onClick={handleClick}>Click me</Button>);
		fireEvent.click(screen.getByText('Click me'));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('can be disabled', () => {
		render(<Button disabled>Click me</Button>);
		const button = screen.getByText('Click me');
		expect(button).toBeDisabled();
		expect(button).toHaveStyle({ cursor: 'not-allowed' });
	});

	it('renders different variants', () => {
		const { rerender } = render(<Button variant='primary'>Primary</Button>);
		expect(screen.getByText('Primary')).toBeInTheDocument();

		rerender(<Button variant='secondary'>Secondary</Button>);
		expect(screen.getByText('Secondary')).toBeInTheDocument();
	});
});
