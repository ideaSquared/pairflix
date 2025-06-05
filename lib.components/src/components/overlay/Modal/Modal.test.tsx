// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\overlay\Modal\Modal.test.tsx
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import Modal from './Modal';
import { StyledModalBody, StyledModalFooter } from './ModalSubComponents';

// Mock theme for styled-components
const mockTheme = {
	colors: {
		overlay: 'rgba(0, 0, 0, 0.5)',
		background: {
			paper: '#ffffff',
			hover: '#f5f5f5',
		},
		border: {
			default: '#e0e0e0',
		},
		text: {
			primary: '#000000',
			secondary: '#666666',
		},
		primary: '#0077cc',
	},
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
	},
	borderRadius: {
		sm: '4px',
		md: '8px',
	},
	shadows: {
		lg: '0 4px 8px rgba(0, 0, 0, 0.1)',
	},
	typography: {
		fontSize: {
			lg: '1.25rem',
		},
		fontWeight: {
			medium: '500',
		},
	},
	breakpoints: {
		sm: '576px',
	},
};

// Helper function to render modal with theme
const renderWithTheme = (ui: React.ReactElement) => {
	return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

// Mock portal container
beforeEach(() => {
	// Create portal root element
	const portalRoot = document.createElement('div');
	portalRoot.setAttribute('id', 'portal-root');
	document.body.appendChild(portalRoot);
});

afterEach(() => {
	// Clean up portal root
	const portalRoot = document.getElementById('portal-root');
	if (portalRoot) {
		document.body.removeChild(portalRoot);
	}
	// Reset the body style that might have been modified by Modal
	document.body.style.overflow = '';
});

describe('Modal', () => {
	const onClose = jest.fn();

	beforeEach(() => {
		// Reset the mock before each test
		onClose.mockReset();
	});

	it('renders nothing when closed', () => {
		renderWithTheme(
			<Modal isOpen={false} onClose={onClose}>
				<div>Modal Content</div>
			</Modal>
		);

		expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
	});

	it('renders modal content when open', () => {
		renderWithTheme(
			<Modal isOpen={true} onClose={onClose}>
				<div>Modal Content</div>
			</Modal>
		);

		expect(screen.getByText('Modal Content')).toBeInTheDocument();
	});

	it('renders title when provided', () => {
		renderWithTheme(
			<Modal isOpen={true} onClose={onClose} title='Modal Title'>
				<div>Modal Content</div>
			</Modal>
		);

		expect(screen.getByText('Modal Title')).toBeInTheDocument();
		expect(screen.getByRole('dialog')).toHaveAttribute(
			'aria-labelledby',
			'modal-title'
		);
	});

	it('calls onClose when close button is clicked', () => {
		renderWithTheme(
			<Modal isOpen={true} onClose={onClose} title='Modal Title'>
				<div>Modal Content</div>
			</Modal>
		);

		const closeButton = screen.getByRole('button', { name: /close/i });
		fireEvent.click(closeButton);

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when clicking outside if closeOnBackdropClick is true', () => {
		renderWithTheme(
			<Modal isOpen={true} onClose={onClose} closeOnBackdropClick={true}>
				<div>Modal Content</div>
			</Modal>
		);

		// Find the modal overlay (backdrop) and click it
		const overlay = screen.getByRole('dialog').parentElement;
		if (overlay) {
			fireEvent.mouseDown(overlay);
		}

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('does not call onClose when clicking outside if closeOnBackdropClick is false', () => {
		renderWithTheme(
			<Modal isOpen={true} onClose={onClose} closeOnBackdropClick={false}>
				<div>Modal Content</div>
			</Modal>
		);

		// Find the modal overlay (backdrop) and click it
		const overlay = screen.getByRole('dialog').parentElement;
		if (overlay) {
			fireEvent.mouseDown(overlay);
		}

		expect(onClose).not.toHaveBeenCalled();
	});

	it('sets correct size styles based on size prop', () => {
		// Test small size
		const { rerender } = renderWithTheme(
			<Modal isOpen={true} onClose={onClose} size='small'>
				<div>Small Modal</div>
			</Modal>
		);

		let modalContent = screen.getByRole('document');
		expect(getComputedStyle(modalContent).maxWidth).toBe('400px');

		// Test medium size (default)
		rerender(
			<ThemeProvider theme={mockTheme}>
				<Modal isOpen={true} onClose={onClose} size='medium'>
					<div>Medium Modal</div>
				</Modal>
			</ThemeProvider>
		);

		modalContent = screen.getByRole('document');
		expect(getComputedStyle(modalContent).maxWidth).toBe('600px');

		// Test large size
		rerender(
			<ThemeProvider theme={mockTheme}>
				<Modal isOpen={true} onClose={onClose} size='large'>
					<div>Large Modal</div>
				</Modal>
			</ThemeProvider>
		);

		modalContent = screen.getByRole('document');
		expect(getComputedStyle(modalContent).maxWidth).toBe('800px');
	});

	it('hides close button when showCloseButton is false', () => {
		renderWithTheme(
			<Modal
				isOpen={true}
				onClose={onClose}
				title='No Close Button'
				showCloseButton={false}
			>
				<div>Modal Content</div>
			</Modal>
		);

		const closeButton = screen.queryByRole('button', { name: /close/i });
		expect(closeButton).not.toBeInTheDocument();
	});

	it('uses custom header render when provided', () => {
		const customHeaderRender = ({ onClose }: { onClose: () => void }) => (
			<div data-testid='custom-header'>
				<h2>Custom Header</h2>
				<button onClick={onClose} data-testid='custom-close'>
					Custom Close
				</button>
			</div>
		);

		renderWithTheme(
			<Modal isOpen={true} onClose={onClose} headerRender={customHeaderRender}>
				<div>Modal Content</div>
			</Modal>
		);

		expect(screen.getByTestId('custom-header')).toBeInTheDocument();
		expect(screen.getByText('Custom Header')).toBeInTheDocument();

		fireEvent.click(screen.getByTestId('custom-close'));
		expect(onClose).toHaveBeenCalled();
	});

	it('blocks body scroll when modal is open and blockScrollOnMount is true', () => {
		renderWithTheme(
			<Modal isOpen={true} onClose={onClose} blockScrollOnMount={true}>
				<div>Modal Content</div>
			</Modal>
		);

		expect(document.body.style.overflow).toBe('hidden');

		// Cleanup
		renderWithTheme(
			<Modal isOpen={false} onClose={onClose} blockScrollOnMount={true}>
				<div>Modal Content</div>
			</Modal>
		);

		// Should be reset after unmounting
		expect(document.body.style.overflow).not.toBe('hidden');
	});

	it('integrates with ModalSubComponents correctly', () => {
		renderWithTheme(
			<Modal isOpen={true} onClose={onClose} title='Complete Modal'>
				<StyledModalBody>
					<p>Modal body content</p>
				</StyledModalBody>
				<StyledModalFooter>
					<button>Cancel</button>
					<button>Confirm</button>
				</StyledModalFooter>
			</Modal>
		);

		expect(screen.getByText('Modal body content')).toBeInTheDocument();
		expect(screen.getByText('Cancel')).toBeInTheDocument();
		expect(screen.getByText('Confirm')).toBeInTheDocument();
	});
});
