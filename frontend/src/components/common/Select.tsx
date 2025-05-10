import styled from 'styled-components';

interface SelectProps {
	error?: boolean;
	fullWidth?: boolean;
	size?: 'small' | 'medium' | 'large';
}

export const Select = styled.select<SelectProps>`
	width: ${({ fullWidth }) => (fullWidth ? '100%' : '200px')};
	padding: ${({ theme }) => theme.spacing.sm};
	background: ${({ theme }) => theme.colors.background.input};
	border: 1px solid
		${({ error, theme }) =>
			error ? theme.colors.text.error : theme.colors.border};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	color: ${({ theme }) => theme.colors.text.primary};
	cursor: pointer;
	font-size: ${({ theme }) => theme.typography.fontSize.md};

	&:focus {
		outline: none;
		border-color: ${({ error, theme }) =>
			error ? theme.colors.text.error : theme.colors.primary};
	}

	option {
		background: ${({ theme }) => theme.colors.background.input};
		color: ${({ theme }) => theme.colors.text.primary};
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.background.secondary};
		cursor: not-allowed;
		opacity: 0.7;
	}
`;

export const SelectLabel = styled.label`
	display: block;
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	color: ${({ theme }) => theme.colors.text.primary};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const SelectError = styled.span`
	display: block;
	color: ${({ theme }) => theme.colors.text.error};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const SelectGroup = styled.div<{ fullWidth?: boolean }>`
	display: flex;
	flex-direction: column;
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;
