import { fireEvent, render, screen } from '../../tests/setup';
import { Input, InputError, InputGroup } from '../common/Input';

describe('Input', () => {
	it('renders with default props', () => {
		render(<Input placeholder='Enter text' />);
		const input = screen.getByPlaceholderText('Enter text');
		expect(input).toBeInTheDocument();
	});

	it('handles value changes', () => {
		const handleChange = jest.fn();
		render(<Input onChange={handleChange} value='' />);
		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'test' } });
		expect(handleChange).toHaveBeenCalled();
	});

	it('can be disabled', () => {
		render(<Input disabled />);
		const input = screen.getByRole('textbox');
		expect(input).toBeDisabled();
	});
});

describe('InputGroup', () => {
	it('renders with label and input', () => {
		render(
			<InputGroup>
				<label>Test Label</label>
				<Input placeholder='Test input' />
			</InputGroup>
		);

		expect(screen.getByText('Test Label')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
	});

	it('shows error message when provided', () => {
		render(
			<InputGroup>
				<Input />
				<InputError>Invalid input</InputError>
			</InputGroup>
		);

		expect(screen.getByText('Invalid input')).toBeInTheDocument();
	});
});
