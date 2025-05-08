import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'danger'
	| 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	disabled?: boolean;
}

const getVariantStyles = (variant: ButtonVariant = 'primary') => {
	const variants = {
		primary: css`
			background: ${theme.colors.primary};
			color: ${theme.colors.text.primary};
			&:hover:not(:disabled) {
				background: ${theme.colors.primaryHover};
			}
		`,
		secondary: css`
			background: ${theme.colors.secondary};
			color: ${theme.colors.text.primary};
			&:hover:not(:disabled) {
				background: ${({ theme }) => theme.colors.border};
			}
		`,
		success: css`
			background: ${theme.colors.text.success};
			color: ${theme.colors.background.primary};
			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		`,
		danger: css`
			background: ${theme.colors.text.error};
			color: ${theme.colors.text.primary};
			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		`,
		warning: css`
			background: ${theme.colors.text.warning};
			color: ${theme.colors.background.primary};
			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		`,
	};
	return variants[variant];
};

const getSizeStyles = (size: ButtonSize = 'medium') => {
	const sizes = {
		small: css`
			padding: ${theme.spacing.xs} ${theme.spacing.sm};
			font-size: ${theme.typography.fontSize.sm};
		`,
		medium: css`
			padding: ${theme.spacing.sm} ${theme.spacing.md};
			font-size: ${theme.typography.fontSize.md};
		`,
		large: css`
			padding: ${theme.spacing.md} ${theme.spacing.lg};
			font-size: ${theme.typography.fontSize.lg};
		`,
	};
	return sizes[size];
};

export const Button = styled.button<ButtonProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: ${theme.borderRadius.sm};
	font-family: ${theme.typography.fontFamily};
	font-weight: ${theme.typography.fontWeight.medium};
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

	${({ variant }) => getVariantStyles(variant)}
	${({ size }) => getSizeStyles(size)}

  &:disabled {
		background: ${theme.colors.secondary};
		cursor: not-allowed;
		opacity: 0.6;
	}

	&:focus-visible {
		outline: 2px solid ${theme.colors.primary};
		outline-offset: 2px;
	}
`;
