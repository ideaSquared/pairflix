import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { H3 } from './Typography';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	size?: 'small' | 'medium' | 'large' | string;
	className?: string;
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
`;

interface ModalContentProps {
	size?: string | undefined;
}

const ModalContent = styled.div<ModalContentProps>`
	background-color: ${({ theme }) =>
		theme?.colors?.background?.paper || '#ffffff'};
	border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
	border: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
	box-shadow: ${({ theme }) =>
		theme?.shadows?.lg || '0 4px 8px rgba(0, 0, 0, 0.1)'};
	width: 100%;
	max-width: ${({ size }) => {
		switch (size) {
			case 'small':
				return '400px';
			case 'medium':
				return '600px';
			case 'large':
				return '800px';
			default:
				return '500px';
		}
	}};
	max-height: 90vh;
	overflow-y: auto;
	padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: ${({ theme }) => theme?.spacing?.md || '1rem'};
	border-bottom: 1px solid ${({ theme }) => theme?.colors?.border || '#e0e0e0'};
	padding-bottom: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
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
`;

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	size,
	className,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const [mounted, setMounted] = useState(false);

	// Ensure we only mount the portal after the component is mounted
	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	useEffect(() => {
		if (!isOpen) return;

		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEsc);
		document.addEventListener('mousedown', handleClickOutside);

		// Prevent scrolling of the body when modal is open
		const originalStyle = window.getComputedStyle(document.body).overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleEsc);
			document.removeEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = originalStyle;
		};
	}, [isOpen, onClose]);

	// Don't render anything on the server or if not mounted yet or if modal is closed
	if (!mounted || !isOpen) return null;

	// Make sure we have a valid DOM element to create the portal
	const portalTarget = document.body;
	if (!portalTarget) return null;

	try {
		return createPortal(
			<ModalOverlay className={className}>
				<ModalContent ref={modalRef} size={size}>
					{title && (
						<ModalHeader>
							<H3>{title}</H3>
							<CloseButton onClick={onClose} aria-label='Close'>
								×
							</CloseButton>
						</ModalHeader>
					)}
					{!title && (
						<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<CloseButton onClick={onClose} aria-label='Close'>
								×
							</CloseButton>
						</div>
					)}
					{children}
				</ModalContent>
			</ModalOverlay>,
			portalTarget
		);
	} catch (error) {
		console.error('Failed to render modal:', error);
		return null;
	}
};
