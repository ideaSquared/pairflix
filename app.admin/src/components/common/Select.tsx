import styled from 'styled-components';

interface SelectProps {
	fullWidth?: boolean;
}

export const Select = styled.select<SelectProps>`
	appearance: none;
	background: ${({ theme }) => theme.colors.background.input};
	color: ${({ theme }) => theme.colors.text.primary};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	font-size: ${({ theme }) => theme.typography.fontSize.md};
	cursor: pointer;
	transition: all 0.2s ease-in-out;

	&:hover {
		border-color: ${({ theme }) => theme.colors.primary};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.primary};
		box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.primary};
		outline-offset: 2px;
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.background.secondary};
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Styling for options */
	& option {
		background: ${({ theme }) => theme.colors.background.input};
		color: ${({ theme }) => theme.colors.text.primary};
		padding: ${({ theme }) => theme.spacing.sm};
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
