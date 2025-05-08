import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

interface InputProps {
	error?: boolean;
	fullWidth?: boolean;
	size?: 'small' | 'medium' | 'large';
}

const getSizeStyles = (size: InputProps['size'] = 'medium') => {
	const sizes = {
		small: css`
			padding: ${theme.spacing.xs} ${theme.spacing.sm};
			font-size: ${theme.typography.fontSize.sm};
		`,
		medium: css`
			padding: ${theme.spacing.sm};
			font-size: ${theme.typography.fontSize.md};
		`,
		large: css`
			padding: ${theme.spacing.md};
			font-size: ${theme.typography.fontSize.lg};
		`,
	};
	return sizes[size];
};

export const Input = styled.input<InputProps>`
	background: ${theme.colors.background.input};
	color: ${theme.colors.text.primary};
	border: 1px solid
		${({ error }) => (error ? theme.colors.text.error : theme.colors.border)};
	border-radius: ${theme.borderRadius.sm};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	font-family: ${theme.typography.fontFamily};
	transition: border-color 0.2s ease;

	${({ size }) => getSizeStyles(size)}

	&:focus {
		outline: none;
		border-color: ${({ error }) =>
			error ? theme.colors.text.error : theme.colors.primary};
	}

	&:disabled {
		background: ${theme.colors.background.secondary};
		cursor: not-allowed;
		opacity: 0.7;
	}

	&::placeholder {
		color: ${theme.colors.text.secondary};
	}

	/* Accessibility */
	&:focus-visible {
		outline: 2px solid ${theme.colors.primary};
		outline-offset: 2px;
	}
`;

export const InputLabel = styled.label`
	display: block;
	margin-bottom: ${theme.spacing.xs};
	color: ${theme.colors.text.primary};
	font-size: ${theme.typography.fontSize.sm};
	font-weight: ${theme.typography.fontWeight.medium};
`;

export const InputError = styled.span`
	display: block;
	color: ${theme.colors.text.error};
	font-size: ${theme.typography.fontSize.sm};
	margin-top: ${theme.spacing.xs};
`;

export const InputGroup = styled.div<{ fullWidth?: boolean }>`
	display: flex;
	flex-direction: column;
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	margin-bottom: ${theme.spacing.md};
`;
