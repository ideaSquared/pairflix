import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';

export interface SwitchProps extends BaseComponentProps {
  /**
   * Whether the switch is checked
   * @default false
   */
  checked?: boolean;

  /**
   * Default checked state (uncontrolled)
   * @default false
   */
  defaultChecked?: boolean;

  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Label for the switch
   */
  label?: string;

  /**
   * Size of the switch
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Color of the switch when checked
   */
  color?: string;

  /**
   * Called when the switch state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Required for accessibility if label is not provided
   */
  'aria-label'?: string;
}

const SwitchWrapper = styled.label<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '8px'};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

const SwitchTrack = styled.div<{
  $checked?: boolean;
  $size?: string;
  $color?: string;
  $disabled?: boolean;
}>`
  position: relative;
  display: inline-block;
  width: ${({ $size }) =>
    $size === 'small' ? '32px' : $size === 'large' ? '56px' : '44px'};
  height: ${({ $size }) =>
    $size === 'small' ? '18px' : $size === 'large' ? '30px' : '24px'};
  background: ${({ $checked, $color, theme }) =>
    $checked
      ? $color || theme?.colors?.primary || '#0077cc'
      : theme?.colors?.border?.default || '#e0e0e0'};
  border-radius: 999px;
  transition: all 0.2s ease;

  &:hover:not([data-disabled='true']) {
    opacity: 0.8;
  }
`;

const SwitchThumb = styled.div<{
  $checked?: boolean;
  $size?: string;
}>`
  position: absolute;
  top: 2px;
  left: 2px;
  width: ${({ $size }) =>
    $size === 'small' ? '14px' : $size === 'large' ? '26px' : '20px'};
  height: ${({ $size }) =>
    $size === 'small' ? '14px' : $size === 'large' ? '26px' : '20px'};
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  transform: translateX(
    ${({ $checked, $size }) =>
      $checked
        ? $size === 'small'
          ? '14px'
          : $size === 'large'
            ? '26px'
            : '20px'
        : '0'}
  );
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SwitchInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const SwitchLabel = styled.span`
  color: ${({ theme }) => theme?.colors?.text?.primary || '#000000'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.md || '16px'};
`;

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked,
      disabled = false,
      label,
      size = 'medium',
      color,
      onChange,
      className,
      'aria-label': ariaLabel,
      ...rest
    },
    ref
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && onChange) {
        onChange(event.target.checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !disabled && onChange) {
        const newChecked = !(checked ?? event.currentTarget.checked);
        onChange(newChecked);
      }
    };

    return (
      <SwitchWrapper $disabled={disabled} className={className}>
        <SwitchInput
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={ref}
          aria-label={ariaLabel || label}
          {...rest}
        />
        <SwitchTrack
          $checked={checked ?? defaultChecked}
          $size={size}
          $color={color}
          $disabled={disabled}
          data-disabled={disabled}
        >
          <SwitchThumb $checked={checked ?? defaultChecked} $size={size} />
        </SwitchTrack>
        {label && <SwitchLabel>{label}</SwitchLabel>}
      </SwitchWrapper>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
