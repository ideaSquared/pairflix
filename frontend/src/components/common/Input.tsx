import styled, { css } from 'styled-components';

interface InputProps {
	size?: 'small' | 'medium' | 'large';
	error?: boolean;
	fullWidth?: boolean;
}

const getSizeStyles = (size: InputProps['size'] = 'medium') => {
	const sizes = {
		small: css`
			padding: ${({ theme }) => theme.spacing.xs}
				${({ theme }) => theme.spacing.sm};
			font-size: ${({ theme }) => theme.typography.fontSize.sm};
		`,
		medium: css`
			padding: ${({ theme }) => theme.spacing.sm};
			font-size: ${({ theme }) => theme.typography.fontSize.md};
		`,
		large: css`
			padding: ${({ theme }) => theme.spacing.md};
			font-size: ${({ theme }) => theme.typography.fontSize.lg};
		`,
	};
	return sizes[size];
};

export const Input = styled.input<InputProps>`
	background: ${({ theme }) => theme.colors.background.input};
	color: ${({ theme }) => theme.colors.text.primary};
	border: 1px solid
		${({ error, theme }) =>
			error ? theme.colors.text.error : theme.colors.border};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	font-family: ${({ theme }) => theme.typography.fontFamily};
	transition: border-color 0.2s ease;

	${({ size }) => getSizeStyles(size)}

	&:focus {
		outline: none;
		border-color: ${({ error, theme }) =>
			error ? theme.colors.text.error : theme.colors.primary};
	}

	&::placeholder {
		color: ${({ theme }) => theme.colors.text.secondary};
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.background.secondary};
		cursor: not-allowed;
		opacity: 0.7;
	}
`;

export const InputGroup = styled.div<{ fullWidth?: boolean }>`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing.xs};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const InputLabel = styled.label`
	color: ${({ theme }) => theme.colors.text.primary};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const InputError = styled.span`
	color: ${({ theme }) => theme.colors.text.error};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	margin-top: ${({ theme }) => theme.spacing.xs};
`;
