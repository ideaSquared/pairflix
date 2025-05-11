import { fireEvent, render, screen } from '../../tests/setup';
import { ErrorBoundary } from '../common/ErrorBoundary';

const ErrorComponent = () => {
	throw new Error('Test error');
};

const consoleError = console.error;
beforeAll(() => {
	console.error = jest.fn();
});

afterAll(() => {
	console.error = consoleError;
});

describe('ErrorBoundary', () => {
	it('renders children when there is no error', () => {
		render(
			<ErrorBoundary>
				<div>Normal content</div>
			</ErrorBoundary>
		);
		expect(screen.getByText('Normal content')).toBeInTheDocument();
	});

	it('renders error UI when there is an error', () => {
		render(
			<ErrorBoundary>
				<ErrorComponent />
			</ErrorBoundary>
		);

		expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		expect(screen.getByText('Test error')).toBeInTheDocument();
	});

	it('allows error reset', () => {
		const { rerender } = render(
			<ErrorBoundary>
				<ErrorComponent />
			</ErrorBoundary>
		);

		fireEvent.click(screen.getByText('Try Again'));

		rerender(
			<ErrorBoundary>
				<div>Normal content</div>
			</ErrorBoundary>
		);

		expect(screen.getByText('Normal content')).toBeInTheDocument();
	});

	it('renders custom fallback when provided', () => {
		render(
			<ErrorBoundary fallback={<div>Custom error UI</div>}>
				<ErrorComponent />
			</ErrorBoundary>
		);

		expect(screen.getByText('Custom error UI')).toBeInTheDocument();
	});
});
