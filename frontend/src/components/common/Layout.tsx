import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface GridProps {
    columns?: number | string;
    gap?: keyof typeof theme.spacing;
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    justifyContent?:
        | 'start'
        | 'center'
        | 'end'
        | 'space-between'
        | 'space-around';
}

export const Grid = styled.div<GridProps>`
    display: grid;
    grid-template-columns: ${({ columns = 1 }) =>
        typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns};
    gap: ${({ gap = 'md' }) => theme.spacing[gap]};
    align-items: ${({ alignItems = 'stretch' }) => alignItems};
    justify-content: ${({ justifyContent = 'start' }) => justifyContent};

    @media (max-width: ${theme.breakpoints.sm}) {
        grid-template-columns: 1fr;
    }
`;

interface ContainerProps {
    maxWidth?: keyof typeof theme.breakpoints | 'none';
    padding?: keyof typeof theme.spacing;
}

export const Container = styled.div<ContainerProps>`
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: ${({ padding = 'md' }) => theme.spacing[padding]};
    padding-right: ${({ padding = 'md' }) => theme.spacing[padding]};
    max-width: ${({ maxWidth = 'lg' }) =>
        maxWidth === 'none' ? 'none' : theme.breakpoints[maxWidth]};
`;

interface FlexProps {
    direction?: 'row' | 'column';
    gap?: keyof typeof theme.spacing;
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    justifyContent?:
        | 'start'
        | 'center'
        | 'end'
        | 'space-between'
        | 'space-around';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

export const Flex = styled.div<FlexProps>`
    display: flex;
    flex-direction: ${({ direction = 'row' }) => direction};
    gap: ${({ gap = 'md' }) => theme.spacing[gap]};
    align-items: ${({ alignItems = 'stretch' }) => alignItems};
    justify-content: ${({ justifyContent = 'start' }) => justifyContent};
    flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
`;

export const Spacer = styled.div<{ size: keyof typeof theme.spacing }>`
    height: ${({ size }) => theme.spacing[size]};
    width: ${({ size }) => theme.spacing[size]};
`;
