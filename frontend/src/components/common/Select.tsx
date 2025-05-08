import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface SelectProps {
	error?: boolean;
	fullWidth?: boolean;
	size?: 'small' | 'medium' | 'large';
}

export const Select = styled.select<SelectProps>`
	appearance: none;
	background: ${theme.colors.background.input};
	color: ${theme.colors.text.primary};
	border: 1px solid
		${({ error }) => (error ? theme.colors.text.error : theme.colors.border)};
	border-radius: ${theme.borderRadius.sm};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	font-family: ${theme.typography.fontFamily};
	font-size: ${({
		size = 'md',
	}: {
		size?: keyof typeof theme.typography.fontSize;
	}) => theme.typography.fontSize[size]};
	padding: ${({ size = 'medium' }) =>
		size === 'small'
			? `${theme.spacing.xs} ${theme.spacing.sm}`
			: size === 'large'
				? `${theme.spacing.md} ${theme.spacing.lg}`
				: `${theme.spacing.sm} ${theme.spacing.md}`};
	cursor: pointer;
	transition: border-color 0.2s ease;

	/* Custom dropdown arrow */
	background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
	background-repeat: no-repeat;
	background-position: right ${theme.spacing.sm} center;
	padding-right: ${theme.spacing.xl};

	&:focus {
		outline: none;
		border-color: ${({ error }) =>
			error ? theme.colors.text.error : theme.colors.primary};
	}

	&:disabled {
		background-color: ${theme.colors.background.secondary};
		cursor: not-allowed;
		opacity: 0.7;
	}

	/* Accessibility */
	&:focus-visible {
		outline: 2px solid ${theme.colors.primary};
		outline-offset: 2px;
	}

	option {
		background-color: ${theme.colors.background.secondary};
		color: ${theme.colors.text.primary};
	}
`;

export const SelectLabel = styled.label`
	display: block;
	margin-bottom: ${theme.spacing.xs};
	color: ${theme.colors.text.primary};
	font-size: ${theme.typography.fontSize.sm};
	font-weight: ${theme.typography.fontWeight.medium};
`;

export const SelectError = styled.span`
	display: block;
	color: ${theme.colors.text.error};
	font-size: ${theme.typography.fontSize.sm};
	margin-top: ${theme.spacing.xs};
`;

export const SelectGroup = styled.div<{ fullWidth?: boolean }>`
	display: flex;
	flex-direction: column;
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	margin-bottom: ${theme.spacing.md};
`;
