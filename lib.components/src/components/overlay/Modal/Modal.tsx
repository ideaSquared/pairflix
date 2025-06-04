import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { BaseComponentProps } from '../../../types';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

/**
 * Props for the Modal component
 */
export interface ModalProps extends BaseComponentProps {
	/**
	 * Whether the modal is open
	 */
	isOpen: boolean;

	/**
	 * Callback when modal is closed
	 */
	onClose: () => void;

	/**
	 * Title of the modal
	 */
	title?: string;

	/**
	 * Size of the modal
	 * @default 'medium'
	 */
	size?: ModalSize | string;

	/**
	 * Whether to close when clicking outside
	 * @default true
	 */
	closeOnBackdropClick?: boolean;

	/**
	 * Whether to close when ESC key is pressed
	 * @default true
	 */
	closeOnEsc?: boolean;

	/**
	 * Initial element to focus when modal opens
	 */
	initialFocusRef?: React.RefObject<HTMLElement>;

	/**
	 * Element to return focus to when modal closes
	 */
	finalFocusRef?: React.RefObject<HTMLElement>;

	/**
	 * Custom render function for header
	 */
	headerRender?: (props: {
		onClose: () => void;
		title?: string;
	}) => React.ReactNode;

	/**
	 * Whether to show the close button
	 * @default true
	 */
	showCloseButton?: boolean;

	/**
	 * Whether to disable scrolling of the body when modal is open
	 * @default true
	 */
	blockScrollOnMount?: boolean;

	/**
	 * Modal content
	 */
	children: React.ReactNode;
}

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: ${({ theme }) =>
		theme?.colors?.overlay || 'rgba(0, 0, 0, 0.5)'};
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: ${({ theme }) => theme?.spacing?.md || '1rem'};
	overflow-y: auto;
	pointer-events: auto;
`;

interface ModalContentProps {
	$size?: string | undefined;
}

const ModalContent = styled.div<ModalContentProps>`
	background-color: ${({ theme }) =>
		theme?.colors?.background?.paper || '#ffffff'};
	border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
	border: 1px solid
		${({ theme }) => theme?.colors?.border?.default || '#e0e0e0'};
	box-shadow: ${({ theme }) =>
		theme?.shadows?.lg || '0 4px 8px rgba(0, 0, 0, 0.1)'};
	width: 100%;
	max-width: ${({ $size }) => {
		switch ($size) {
			case 'small':
				return '400px';
			case 'medium':
				return '600px';
			case 'large':
				return '800px';
			case 'fullscreen':
				return '100%';
			default:
				if (
					typeof $size === 'string' &&
					$size.match(/^\d+(%|px|em|rem|vh|vw)$/)
				) {
					return $size;
				}
				return '600px';
		}
	}};
	max-height: ${({ $size }) => ($size === 'fullscreen' ? '100%' : '90vh')};
	overflow-y: auto;
	padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
	position: relative;
	margin: ${({ $size }) => ($size === 'fullscreen' ? '0' : '10px')};
	display: flex;
	flex-direction: column;

	/* Responsive padding for mobile */
	@media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		padding: ${({ theme }) => theme?.spacing?.md || '1rem'};
		max-height: 95vh;
	}
`;

const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
	border-bottom: 1px solid
		${({ theme }) => theme?.colors?.border?.default || '#e0e0e0'};
	padding-bottom: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const ModalTitle = styled.h3`
	margin: 0;
	font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
	font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
	color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	font-size: 1.5rem;
	color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
	display: flex;
	align-items: center;
	justify-content: center;
	padding: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
	border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
	transition: all 0.2s ease;

	&:hover {
		color: ${({ theme }) => theme?.colors?.text?.primary || '#000'};
		background-color: ${({ theme }) =>
			theme?.colors?.background?.hover || '#f5f5f5'};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme?.colors?.primary || '#0077cc'};
		outline-offset: 2px;
	}

	/* Larger touch target on mobile */
	@media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		padding: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
	}
`;

/**
 * Modal component for displaying content in an overlay
 */
export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	size = 'medium',
	closeOnBackdropClick = true,
	closeOnEsc = true,
	initialFocusRef,
	finalFocusRef,
	headerRender,
	showCloseButton = true,
	blockScrollOnMount = true,
	className,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);
	const previousActiveElement = useRef<Element | null>(null);

	// Use our custom focus trap hook
	useFocusTrap(modalRef, isOpen && closeOnEsc, onClose);

	// Ensure we only mount the portal after the component is mounted
	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	// Handle initial and final focus
	useEffect(() => {
		if (isOpen) {
			previousActiveElement.current = document.activeElement;

			// Focus the initial element if specified, otherwise first focusable element is handled by useFocusTrap
			if (initialFocusRef?.current) {
				initialFocusRef.current.focus();
			}
		} else {
			// Restore focus when modal closes
			if (finalFocusRef?.current) {
				finalFocusRef.current.focus();
			} else if (previousActiveElement.current instanceof HTMLElement) {
				previousActiveElement.current.focus();
			}
		}
	}, [isOpen, initialFocusRef, finalFocusRef]);

	// Handle click outside
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				closeOnBackdropClick &&
				modalRef.current &&
				!modalRef.current.contains(e.target as Node)
			) {
				onClose();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		// Prevent scrolling of the body when modal is open
		if (blockScrollOnMount) {
			const originalStyle = window.getComputedStyle(document.body).overflow;
			document.body.style.overflow = 'hidden';

			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
				document.body.style.overflow = originalStyle;
			};
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose, closeOnBackdropClick, blockScrollOnMount]);

	// Don't render anything on the server or if not mounted yet or if modal is closed
	if (!mounted || !isOpen) return null;

	// Make sure we have a valid DOM element to create the portal
	const portalTarget = document.body;
	if (!portalTarget) return null;

	const modalContent = (
		<ModalOverlay
			className={className}
			aria-modal='true'
			role='dialog'
			aria-labelledby={title ? 'modal-title' : undefined}
		>
			<ModalContent ref={modalRef} $size={size} role='document'>
				{headerRender ? (
					headerRender({ onClose, title })
				) : title || showCloseButton ? (
					<ModalHeader>
						{title && <ModalTitle id='modal-title'>{title}</ModalTitle>}
						{showCloseButton && (
							<CloseButton onClick={onClose} aria-label='Close'>
								&times;
							</CloseButton>
						)}
					</ModalHeader>
				) : null}
				{children}
			</ModalContent>
		</ModalOverlay>
	);

	return createPortal(modalContent, portalTarget);
};

export default Modal;
