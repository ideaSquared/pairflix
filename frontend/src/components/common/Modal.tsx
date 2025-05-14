import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { H3 } from './Typography';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const ModalContent = styled.div`
	background-color: ${({ theme }) => theme.colors.background.paper};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	box-shadow: ${({ theme }) => theme.shadows.lg};
	width: 100%;
	max-width: 500px;
	max-height: 80vh;
	overflow-y: auto;
	padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	cursor: pointer;
	font-size: 1.5rem;
	color: ${({ theme }) => theme.colors.text.secondary};
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		color: ${({ theme }) => theme.colors.text.primary};
	}
`;

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
}) => {
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(e.target as Node) &&
				isOpen
			) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEsc);
		document.addEventListener('mousedown', handleClickOutside);

		// Prevent scrolling of the body when modal is open
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEsc);
			document.removeEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<ModalOverlay>
			<ModalContent ref={modalRef}>
				<ModalHeader>
					{title && <H3>{title}</H3>}
					<CloseButton onClick={onClose}>×</CloseButton>
				</ModalHeader>
				{children}
			</ModalContent>
		</ModalOverlay>,
		document.body
	);
};
