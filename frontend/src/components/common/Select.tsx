import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface SelectProps {
    error?: boolean;
    fullWidth?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const Select = styled.select<SelectProps>`
    width: ${({ fullWidth }) => (fullWidth ? '100%' : '200px')};
    padding: ${theme.spacing.sm};
    background: ${theme.colors.background.input};
    border: 1px solid ${({ error }) =>
        error ? theme.colors.text.error : theme.colors.border};
    border-radius: ${theme.borderRadius.sm};
    color: ${theme.colors.text.primary};
    cursor: pointer;
    font-size: ${theme.typography.fontSize.md};

    &:focus {
        outline: none;
        border-color: ${({ error }) =>
            error ? theme.colors.text.error : theme.colors.primary};
    }

    option {
        background: ${theme.colors.background.input};
        color: ${theme.colors.text.primary};
    }

    &:disabled {
        background: ${theme.colors.background.secondary};
        cursor: not-allowed;
        opacity: 0.7;
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
