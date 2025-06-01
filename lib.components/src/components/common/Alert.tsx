import React from 'react';
import styled from 'styled-components';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
	variant: AlertVariant;
	children: React.ReactNode;
	onClose?: () => void;
	title?: string;
	icon?: React.ReactNode;
	className?: string;
}

const getAlertColors = (variant: AlertVariant, theme: any) => {
	switch (variant) {
		case 'success':
			return {
				bg: theme?.colors?.text?.success + '20' || '#4caf5020',
				border: theme?.colors?.text?.success || '#4caf50',
				text: theme?.colors?.text?.success || '#4caf50',
				icon: '✓',
			};
		case 'error':
			return {
				bg: theme?.colors?.text?.error + '20' || '#f4433620',
				border: theme?.colors?.text?.error || '#f44336',
				text: theme?.colors?.text?.error || '#f44336',
				icon: '✕',
			};
		case 'warning':
			return {
				bg: theme?.colors?.text?.warning + '20' || '#ff980020',
				border: theme?.colors?.text?.warning || '#ff9800',
				text: theme?.colors?.text?.warning || '#ff9800',
				icon: '⚠',
			};
		case 'info':
		default:
			return {
				bg: theme?.colors?.primary + '20' || '#2196f320',
				border: theme?.colors?.primary || '#2196f3',
				text: theme?.colors?.primary || '#2196f3',
				icon: 'ℹ',
			};
	}
};

const AlertContainer = styled.div<{ variant: AlertVariant }>`
	background: ${({ theme, variant }) => getAlertColors(variant, theme).bg};
	border: 1px solid
		${({ theme, variant }) => getAlertColors(variant, theme).border};
	color: ${({ theme, variant }) => getAlertColors(variant, theme).text};
	padding: ${({ theme }) => theme?.spacing?.md || '12px'};
	border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
	margin-bottom: ${({ theme }) => theme?.spacing?.md || '12px'};
	position: relative;
	font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '14px'};
	line-height: 1.5;
	display: flex;
	align-items: flex-start;
`;

const AlertIcon = styled.div`
	margin-right: ${({ theme }) => theme?.spacing?.sm || '8px'};
	font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '18px'};
	flex-shrink: 0;
`;

const AlertContent = styled.div`
	flex: 1;
	padding-right: ${({ theme }) => theme?.spacing?.xl || '24px'};
`;

const AlertTitle = styled.div`
	font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
	margin-bottom: ${({ theme }) => theme?.spacing?.xs || '4px'};
`;

const CloseButton = styled.button`
	position: absolute;
	top: ${({ theme }) => theme?.spacing?.xs || '4px'};
	right: ${({ theme }) => theme?.spacing?.xs || '4px'};
	padding: ${({ theme }) => theme?.spacing?.xs || '4px'};
	background: none;
	border: none;
	cursor: pointer;
	font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '18px'};
	color: inherit;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};

	&:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
`;

/**
 * Alert component for displaying important messages to users
 */
export const Alert: React.FC<AlertProps> = ({
	variant,
	children,
	onClose,
	title,
	icon,
	className,
}) => {
	// Get the default icon if none is provided
	const defaultIcon = getAlertColors(variant, {}).icon;

	return (
		<AlertContainer variant={variant} className={className} role='alert'>
			{(icon !== undefined || defaultIcon) && (
				<AlertIcon>{icon || defaultIcon}</AlertIcon>
			)}
			<AlertContent>
				{title && <AlertTitle>{title}</AlertTitle>}
				{children}
			</AlertContent>
			{onClose && (
				<CloseButton onClick={onClose} aria-label='Close alert'>
					×
				</CloseButton>
			)}
		</AlertContainer>
	);
};

// Additional component for Toast-style alerts that auto-dismiss
interface ToastProps extends AlertProps {
	duration?: number;
	position?:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center';
}

export const Toast: React.FC<ToastProps> = ({
	duration = 5000,
	onClose = () => {},
	position = 'top-right',
	...props
}) => {
	React.useEffect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				onClose();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [duration, onClose]);

	return <Alert onClose={onClose} {...props} />;
};
