import React, {
	createContext,
	useCallback,
	useContext,
	useReducer,
} from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Toast } from './Toast';

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition =
	| 'top-right'
	| 'top-left'
	| 'bottom-right'
	| 'bottom-left'
	| 'top-center'
	| 'bottom-center';

export interface ToastOptions {
	/**
	 * Type of toast message
	 * @default 'info'
	 */
	type?: ToastType;

	/**
	 * Duration in milliseconds before auto-dismissing
	 * @default 5000
	 */
	duration?: number;

	/**
	 * Position of the toast
	 * @default 'top-right'
	 */
	position?: ToastPosition;

	/**
	 * Whether to pause timer on hover
	 * @default true
	 */
	pauseOnHover?: boolean;

	/**
	 * Whether toast can be manually closed
	 * @default true
	 */
	closeable?: boolean;
}

export interface ToastProps extends Required<Omit<ToastOptions, 'position'>> {
	/**
	 * Unique ID of the toast
	 */
	id: string;

	/**
	 * Message to display
	 */
	message: string;

	/**
	 * Toast variant (same as type for consistency)
	 */
	variant: ToastType;
}

type ToastAction =
	| { type: 'ADD_TOAST'; toast: ToastProps }
	| { type: 'REMOVE_TOAST'; id: string };

interface ToastState {
	toasts: ToastProps[];
}

const ToastContext = createContext<{
	addToast: (message: string, options?: ToastOptions) => void;
	removeToast: (id: string) => void;
} | null>(null);

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
	switch (action.type) {
		case 'ADD_TOAST':
			return {
				...state,
				toasts: [...state.toasts, action.toast],
			};
		case 'REMOVE_TOAST':
			return {
				...state,
				toasts: state.toasts.filter((toast) => toast.id !== action.id),
			};
		default:
			return state;
	}
};

const ToastContainer = styled.div<{ position: ToastPosition }>`
	position: fixed;
	z-index: 1000;
	${({ position = 'top-right' }) => {
		switch (position) {
			case 'top-right':
				return 'top: 1rem; right: 1rem;';
			case 'top-left':
				return 'top: 1rem; left: 1rem;';
			case 'bottom-right':
				return 'bottom: 1rem; right: 1rem;';
			case 'bottom-left':
				return 'bottom: 1rem; left: 1rem;';
			case 'top-center':
				return 'top: 1rem; left: 50%; transform: translateX(-50%);';
			case 'bottom-center':
				return 'bottom: 1rem; left: 50%; transform: translateX(-50%);';
		}
	}}
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	max-width: 100%;
	width: max-content;
`;

interface ToastWithPosition extends ToastProps {
	position: ToastPosition;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

	const addToast = useCallback(
		(message: string, options: ToastOptions = {}) => {
			const id = Math.random().toString(36).substr(2, 9);
			dispatch({
				type: 'ADD_TOAST',
				toast: {
					id,
					message,
					type: options.type || 'info',
					variant: options.type || 'info',
					duration: options.duration || 5000,
					pauseOnHover: options.pauseOnHover ?? true,
					closeable: options.closeable ?? true,
				} as ToastProps,
			});
		},
		[]
	);

	const removeToast = useCallback((id: string) => {
		dispatch({ type: 'REMOVE_TOAST', id });
	}, []);

	// Group toasts by position
	const toastsByPosition = state.toasts.reduce<
		Record<ToastPosition, ToastProps[]>
	>(
		(acc, toast) => {
			const position = 'top-right' as ToastPosition; // Default position
			if (!acc[position]) {
				acc[position] = [];
			}
			acc[position].push(toast);
			return acc;
		},
		{
			'top-right': [],
			'top-left': [],
			'bottom-right': [],
			'bottom-left': [],
			'top-center': [],
			'bottom-center': [],
		}
	);

	return (
		<ToastContext.Provider value={{ addToast, removeToast }}>
			{children}
			{createPortal(
				<>
					{Object.entries(toastsByPosition).map(([position, toasts]) => (
						<ToastContainer key={position} position={position as ToastPosition}>
							{toasts.map((toast) => (
								<Toast
									key={toast.id}
									toast={toast}
									onClose={() => removeToast(toast.id)}
								/>
							))}
						</ToastContainer>
					))}
				</>,
				document.body
			)}
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
};
