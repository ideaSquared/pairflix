import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import React from 'react';
import type { BaseComponentProps, Size } from '../../../types';
import * as styles from './DropdownMenu.css';

/**
 * Alignment options for dropdown menu content
 */
export type DropdownMenuAlign = 'start' | 'center' | 'end';

/**
 * Side options for dropdown menu positioning
 */
export type DropdownMenuSide = 'top' | 'right' | 'bottom' | 'left';

/**
 * Variant options for dropdown menu styling
 */
export type DropdownMenuVariant = 'default' | 'dark' | 'light' | 'elevated';

/**
 * Props for the main DropdownMenu component
 */
export interface DropdownMenuProps extends BaseComponentProps {
  /**
   * The trigger element that opens the dropdown menu
   */
  trigger: React.ReactNode;

  /**
   * The content of the dropdown menu
   */
  children: React.ReactNode;

  /**
   * Whether the dropdown is open (controlled)
   */
  open?: boolean;

  /**
   * Default open state (uncontrolled)
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback fired when the open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether the dropdown should be modal (blocks interaction with other elements)
   * @default false
   */
  modal?: boolean;

  /**
   * Visual variant of the dropdown menu
   * @default 'default'
   */
  variant?: DropdownMenuVariant;

  /**
   * Size of the dropdown menu and its items
   * @default 'medium'
   */
  size?: Size;

  /**
   * Alignment of the dropdown content relative to the trigger
   * @default 'start'
   */
  align?: DropdownMenuAlign;

  /**
   * Side where the dropdown should appear
   * @default 'bottom'
   */
  side?: DropdownMenuSide;

  /**
   * Distance in pixels from the trigger
   * @default 4
   */
  sideOffset?: number;

  /**
   * Distance in pixels from the align edge
   * @default 0
   */
  alignOffset?: number;

  /**
   * Whether to prevent the dropdown from being clipped by viewport
   * @default true
   */
  avoidCollisions?: boolean;

  /**
   * Custom collision boundary element
   */
  collisionBoundary?: Element | Element[];

  /**
   * Padding around collision boundary
   * @default 0
   */
  collisionPadding?: number;

  /**
   * Whether the dropdown should stick to the viewport edge when near boundary
   * @default false
   */
  sticky?: 'partial' | 'always';
}

/**
 * Props for DropdownMenuItem component
 */
export interface DropdownMenuItemProps extends BaseComponentProps {
  /**
   * Content of the menu item
   */
  children: React.ReactNode;

  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Visual variant of the menu item
   * @default 'default'
   */
  variant?: 'default' | 'destructive' | 'success';

  /**
   * Size of the menu item
   * @default 'medium'
   */
  size?: Size;

  /**
   * Icon to display before the content
   */
  icon?: React.ReactNode;

  /**
   * Keyboard shortcut text to display
   */
  shortcut?: string;

  /**
   * Click handler for the menu item
   */
  onSelect?: (event: Event) => void;

  /**
   * Whether clicking the item should close the menu
   * @default true
   */
  closeOnSelect?: boolean;
}

/**
 * Props for DropdownMenuLabel component
 */
export interface DropdownMenuLabelProps extends BaseComponentProps {
  /**
   * Content of the label
   */
  children: React.ReactNode;

  /**
   * Size of the label
   * @default 'medium'
   */
  size?: Size;
}

/**
 * Props for DropdownMenuCheckboxItem component
 */
export interface DropdownMenuCheckboxItemProps extends BaseComponentProps {
  /**
   * Content of the checkbox item
   */
  children: React.ReactNode;

  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;

  /**
   * Callback fired when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;

  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Size of the checkbox item
   * @default 'medium'
   */
  size?: Size;
}

/**
 * Props for DropdownMenuSubTrigger component
 */
export interface DropdownMenuSubTriggerProps extends BaseComponentProps {
  /**
   * Content of the sub-trigger
   */
  children: React.ReactNode;

  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Size of the sub-trigger
   * @default 'medium'
   */
  size?: Size;

  /**
   * Icon to display before the content
   */
  icon?: React.ReactNode;
}

/**
 * Props for DropdownMenuSubContent component
 */
export interface DropdownMenuSubContentProps extends BaseComponentProps {
  /**
   * Visual variant of the sub-menu content
   * @default 'default'
   */
  variant?: DropdownMenuVariant;

  /**
   * Size of the sub-menu content
   * @default 'medium'
   */
  size?: Size;

  /**
   * Content of the sub-menu
   */
  children?: React.ReactNode;
}

/**
 * DropdownMenu - A flexible dropdown menu component built on Radix UI
 *
 * Features:
 * - Multiple visual variants (default, dark, light, elevated)
 * - Configurable sizing and positioning
 * - Keyboard navigation support
 * - Accessibility features built-in
 * - Support for icons, shortcuts, and nested menus
 * - Checkbox items for selections
 * - Customizable animations and styling
 *
 * @example
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button>Open Menu</Button>}
 *   variant="elevated"
 *   size="large"
 * >
 *   <DropdownMenuLabel>Actions</DropdownMenuLabel>
 *   <DropdownMenuItem icon={<EditIcon />} shortcut="⌘E">
 *     Edit
 *   </DropdownMenuItem>
 *   <DropdownMenuSeparator />
 *   <DropdownMenuItem variant="destructive">
 *     Delete
 *   </DropdownMenuItem>
 * </DropdownMenu>
 * ```
 */
export const DropdownMenu = ({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  variant = 'default',
  size = 'medium',
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  alignOffset = 0,
  avoidCollisions = true,
  collisionBoundary,
  collisionPadding = 0,
  sticky = 'partial',
  ...props
}: DropdownMenuProps) => (
  <RadixDropdownMenu.Root
    open={open}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    modal={modal}
    {...props}
  >
    <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        className={styles.content({ variant, size })}
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        avoidCollisions={avoidCollisions}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  </RadixDropdownMenu.Root>
);

/**
 * DropdownMenuItem - Individual item within a dropdown menu
 *
 * @example
 * ```tsx
 * <DropdownMenuItem
 *   icon={<SaveIcon />}
 *   shortcut="⌘S"
 *   onSelect={() => handleSave()}
 * >
 *   Save File
 * </DropdownMenuItem>
 * ```
 */
export const DropdownMenuItem = ({
  children,
  disabled = false,
  variant = 'default',
  size = 'medium',
  icon,
  shortcut,
  onSelect,
  closeOnSelect = true,
  className,
  ...props
}: DropdownMenuItemProps) => (
  <RadixDropdownMenu.Item
    className={clsx(styles.item({ variant, size }), className)}
    disabled={disabled}
    onSelect={
      closeOnSelect
        ? onSelect
        : event => {
            event.preventDefault();
            onSelect?.(event);
          }
    }
    {...props}
  >
    {icon && <span className={styles.itemIcon}>{icon}</span>}
    <span>{children}</span>
    {shortcut && <span className={styles.itemShortcut}>{shortcut}</span>}
  </RadixDropdownMenu.Item>
);

/**
 * DropdownMenuSeparator - Visual separator between menu sections
 */
export const DropdownMenuSeparator = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>) => (
  <RadixDropdownMenu.Separator
    className={clsx(styles.separator, className)}
    {...props}
  />
);

/**
 * DropdownMenuLabel - Section label for grouping menu items
 *
 * @example
 * ```tsx
 * <DropdownMenuLabel size="large">
 *   File Operations
 * </DropdownMenuLabel>
 * ```
 */
export const DropdownMenuLabel = ({
  children,
  size = 'medium',
  className,
  ...props
}: DropdownMenuLabelProps) => (
  <RadixDropdownMenu.Label
    className={clsx(styles.label({ size }), className)}
    {...props}
  >
    {children}
  </RadixDropdownMenu.Label>
);

/**
 * DropdownMenuCheckboxItem - Checkbox item for toggleable options
 *
 * @example
 * ```tsx
 * <DropdownMenuCheckboxItem
 *   checked={isVisible}
 *   onCheckedChange={setIsVisible}
 * >
 *   Show Sidebar
 * </DropdownMenuCheckboxItem>
 * ```
 */
export const DropdownMenuCheckboxItem = ({
  children,
  checked,
  onCheckedChange,
  disabled = false,
  size = 'medium',
  className,
  ...props
}: DropdownMenuCheckboxItemProps) => (
  <RadixDropdownMenu.CheckboxItem
    className={clsx(styles.checkboxItem({ size }), className)}
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    {...props}
  >
    <RadixDropdownMenu.ItemIndicator className={styles.itemIndicator} />
    {children}
  </RadixDropdownMenu.CheckboxItem>
);

/**
 * DropdownMenuSubTrigger - Trigger for nested sub-menus
 *
 * @example
 * ```tsx
 * <DropdownMenuSub>
 *   <DropdownMenuSubTrigger icon={<FolderIcon />}>
 *     Export
 *   </DropdownMenuSubTrigger>
 *   <DropdownMenuSubContent>
 *     <DropdownMenuItem>Export as PDF</DropdownMenuItem>
 *     <DropdownMenuItem>Export as CSV</DropdownMenuItem>
 *   </DropdownMenuSubContent>
 * </DropdownMenuSub>
 * ```
 */
export const DropdownMenuSubTrigger = ({
  children,
  disabled = false,
  size = 'medium',
  icon,
  className,
  ...props
}: DropdownMenuSubTriggerProps) => (
  <RadixDropdownMenu.SubTrigger
    className={clsx(styles.subTrigger({ size }), className)}
    disabled={disabled}
    {...props}
  >
    {icon && <span className={styles.itemIcon}>{icon}</span>}
    <span>{children}</span>
  </RadixDropdownMenu.SubTrigger>
);

/**
 * DropdownMenuSub - Container for nested sub-menus
 */
export const DropdownMenuSub = RadixDropdownMenu.Sub;

/**
 * DropdownMenuSubContent - Content container for sub-menus
 */
export const DropdownMenuSubContent = ({
  variant = 'default',
  size = 'medium',
  children,
  className,
  ...props
}: DropdownMenuSubContentProps) => (
  <RadixDropdownMenu.Portal>
    <RadixDropdownMenu.SubContent
      className={clsx(styles.content({ variant, size }), className)}
      {...props}
    >
      {children}
    </RadixDropdownMenu.SubContent>
  </RadixDropdownMenu.Portal>
);

// Export the root component as default
export default DropdownMenu;
