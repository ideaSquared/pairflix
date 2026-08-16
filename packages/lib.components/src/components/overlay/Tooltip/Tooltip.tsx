import * as RadixTooltip from '@radix-ui/react-tooltip';
import React from 'react';
import * as styles from './Tooltip.css';

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
      <RadixTooltip.Content
        className={styles.content}
        side={side}
        sideOffset={sideOffset}
      >
        {content}
        <RadixTooltip.Arrow className={styles.arrow} />
      </RadixTooltip.Content>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);

export default Tooltip;
