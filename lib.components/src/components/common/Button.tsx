import styled, { css } from 'styled-components';

export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'success'
	| 'danger'
	| 'warning'
	| 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	disabled?: boolean;
}

const getVariantStyles = (variant: ButtonVariant = 'primary') => {
	const variants = {
		primary: css`
			background: ${({ theme }) => theme.colors.primary};
			color: #ffffff;
			&:hover:not(:disabled) {
				background: ${({ theme }) => theme.colors.primaryHover};
			}
		`,
		secondary: css`
			background: ${({ theme }) => theme.colors.background.secondary};
			color: ${({ theme }) => theme.colors.text.primary};
			border: 1px solid ${({ theme }) => theme.colors.border.default};
			&:hover:not(:disabled) {
				background: ${({ theme }) => theme.colors.background.hover};
			}
		`,
		success: css`
			background: ${({ theme }) => theme.colors.text.success};
			color: #ffffff;
			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		`,
		danger: css`
			background: ${({ theme }) => theme.colors.text.error};
			color: #ffffff;
			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		`,
		warning: css`
			background: ${({ theme }) => theme.colors.text.warning};
			color: #000000;
			&:hover:not(:disabled) {
				opacity: 0.9;
			}
		`,
		text: css`
			background: transparent;
			color: ${({ theme }) => theme.colors.primary};
			padding: ${({ theme }) => theme.spacing.xs};
			&:hover:not(:disabled) {
				text-decoration: underline;
				background: transparent;
			}
		`,
	};
	return variants[variant];
};

const getSizeStyles = (size: ButtonSize = 'medium') => {
	const sizes = {
		small: css`
			padding: ${({ theme }) => theme.spacing.xs}
				${({ theme }) => theme.spacing.sm};
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
		`,
		medium: css`
			padding: ${({ theme }) => theme.spacing.sm}
				${({ theme }) => theme.spacing.md};
			font-size: ${({ theme }) => theme.typography.fontSize.md};
		`,
		large: css`
			padding: ${({ theme }) => theme.spacing.md}
				${({ theme }) => theme.spacing.lg};
			font-size: ${({ theme }) => theme.typography.fontSize.lg};
		`,
	};
	return sizes[size];
};

interface StyledButtonProps {
	$variant: ButtonVariant;
	$size: ButtonSize;
	$fullWidth: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	font-family: ${({ theme }) => theme.typography.fontFamily};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
	gap: ${({ theme }) => theme.spacing.xs};

	${({ $variant }) => getVariantStyles($variant)}
	${({ $size }) => getSizeStyles($size)}

    &:disabled {
		background: ${({ theme }) => theme.colors.secondary};
		cursor: not-allowed;
		opacity: 0.6;
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.primary};
		outline-offset: 2px;
	}
`;

export const Button: React.FC<
	ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({
	variant = 'primary',
	size = 'medium',
	fullWidth = false,
	disabled = false,
	children,
	...props
}) => {
	return (
		<StyledButton
			$variant={variant}
			$size={size}
			$fullWidth={fullWidth}
			disabled={disabled}
			{...props}
		>
			{children}
		</StyledButton>
	);
};
