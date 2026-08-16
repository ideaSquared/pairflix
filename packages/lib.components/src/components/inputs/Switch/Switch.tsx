import clsx from 'clsx';
import React, { forwardRef } from 'react';
import type { BaseComponentProps } from '../../../types';
import {
  switchInput,
  switchLabel,
  switchThumb,
  switchTrack,
  switchWrapper,
} from './Switch.css';

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

    const isChecked = checked ?? defaultChecked;

    return (
      <label className={clsx(switchWrapper({ disabled }), className)}>
        <input
          type="checkbox"
          className={switchInput}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={ref}
          aria-label={ariaLabel || label}
          {...rest}
        />
        <div
          className={switchTrack({ checked: isChecked, size })}
          style={isChecked && color ? { background: color } : undefined}
          data-disabled={disabled}
        >
          <div className={switchThumb({ checked: isChecked, size })} />
        </div>
        {label && <span className={switchLabel}>{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
