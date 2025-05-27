import { render, screen } from '../../tests/setup';
import { Loading } from '../common/Loading';

describe('Loading', () => {
	it('renders with default props', () => {
		render(<Loading />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('renders with custom message', () => {
		render(<Loading message='Custom loading message' />);
		expect(screen.getByText('Custom loading message')).toBeInTheDocument();
	});

	it('renders with custom size', () => {
		render(<Loading size={60} />);
		const spinner = screen.getByText('Loading...').previousSibling;
		expect(spinner).toHaveStyle({ width: '60px', height: '60px' });
	});

	it('renders in fullscreen mode', () => {
		render(<Loading fullScreen />);
		const container =
			screen.getByText('Loading...').parentElement?.parentElement;
		expect(container).toHaveStyle({
			position: 'fixed',
			top: '0',
			left: '0',
			right: '0',
			bottom: '0',
		});
	});
});
