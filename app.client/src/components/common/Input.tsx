import styled from 'styled-components';

interface InputProps {
	fullWidth?: boolean;
	error?: boolean;
}

export const Input = styled.input<InputProps>`
	background: ${({ theme }) => theme.colors.background.input};
	color: ${({ theme }) => theme.colors.text.primary};
	border: 1px solid
		${({ error, theme }) =>
			error ? theme.colors.text.error : theme.colors.border};
	border-radius: ${({ theme }) => theme.borderRadius.sm};
	padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	font-size: ${({ theme }) => theme.typography.fontSize.md};
	transition: all 0.2s ease-in-out;

	&::placeholder {
		color: ${({ theme }) => theme.colors.text.secondary};
		opacity: 0.8;
	}

	&:hover {
		border-color: ${({ error, theme }) =>
			error ? theme.colors.text.error : theme.colors.primary};
	}

	&:focus {
		outline: none;
		border-color: ${({ error, theme }) =>
			error ? theme.colors.text.error : theme.colors.primary};
		box-shadow: 0 0 0 2px
			${({ error, theme }) =>
				error ? `${theme.colors.text.error}40` : `${theme.colors.primary}40`};
	}

	&:focus-visible {
		outline: 2px solid
			${({ error, theme }) =>
				error ? theme.colors.text.error : theme.colors.primary};
		outline-offset: 2px;
	}

	&:disabled {
		background: ${({ theme }) => theme.colors.background.secondary};
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* Mobile optimizations */
	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		padding: calc(${({ theme }) => theme.spacing.sm} * 0.8)
			${({ theme }) => theme.spacing.sm};
		font-size: ${({ theme }) => theme.typography.fontSize.sm};
		/* Increase tap target size for better mobile usability */
		min-height: 44px;

		/* Ensure 100% width on mobile for all inputs */
		width: 100%;
	}
`;

export const InputLabel = styled.label`
	display: block;
	margin-bottom: ${({ theme }) => theme.spacing.xs};
	color: ${({ theme }) => theme.colors.text.primary};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		margin-bottom: calc(${({ theme }) => theme.spacing.xs} * 0.8);
	}
`;

export const InputError = styled.span`
	display: block;
	color: ${({ theme }) => theme.colors.text.error};
	font-size: ${({ theme }) => theme.typography.fontSize.sm};
	margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const InputGroup = styled.div<{ fullWidth?: boolean }>`
	display: flex;
	flex-direction: column;
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	margin-bottom: ${({ theme }) => theme.spacing.md};

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		width: 100%; /* Force full width on mobile */
		margin-bottom: ${({ theme }) => theme.spacing.sm};
	}
`;
