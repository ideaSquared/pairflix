import * as RadixTooltip from '@radix-ui/react-tooltip';
import React from 'react';
import styled from 'styled-components';

const StyledContent = styled(RadixTooltip.Content)`
  background: ${({ theme }) => theme.colors.text.primary || '#000'};
  color: ${({ theme }) => theme.colors.text.onPrimary || '#fff'};
  border-radius: ${({ theme }) => theme.borderRadius.sm || '4px'};
  padding: ${({ theme }) => theme.spacing.xs || '4px'}
    ${({ theme }) => theme.spacing.sm || '8px'};
  font-size: ${({ theme }) => theme.typography.fontSize.sm || '14px'};
  box-shadow: ${({ theme }) =>
    theme.shadows.sm || '0 2px 8px rgba(0,0,0,0.15)'};
  z-index: 1000;
  user-select: none;
  pointer-events: auto;
  &[data-state='delayed-open'] {
    animation: fadeIn 0.2s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const StyledArrow = styled(RadixTooltip.Arrow)`
  fill: ${({ theme }) => theme.colors.text.primary || '#000'};
`;

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

export const Tooltip = ({
  content,
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 200,
  side = 'top',
  sideOffset = 8,
  ...props
}: TooltipProps) => (
  <RadixTooltip.Provider delayDuration={delayDuration}>
    <RadixTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      {...props}
    >
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <StyledContent side={side} sideOffset={sideOffset}>
        {content}
        <StyledArrow />
      </StyledContent>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);

export default Tooltip;
