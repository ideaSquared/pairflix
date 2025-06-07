import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';
import styled from 'styled-components';
import { BaseComponentProps, Size } from '../../../types';

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
 * Styled content container for the dropdown menu
 * Supports different variants and themes
 */
const StyledContent = styled(RadixDropdownMenu.Content)<{
	$variant: DropdownMenuVariant;
	$size: Size;
}>`
	background: ${({ theme, $variant }) => {
		switch ($variant) {
			case 'dark':
				return theme.colors.background.dark || '#2d2d2d';
			case 'light':
				return theme.colors.background.light || '#ffffff';
			case 'elevated':
				return theme.colors.background.paper || '#ffffff';
			default:
				return theme.colors.background.paper || '#ffffff';
		}
	}};
	color: ${({ theme, $variant }) => {
		switch ($variant) {
			case 'dark':
				return theme.colors.text.onDark || '#ffffff';
			case 'light':
				return theme.colors.text.primary || '#000000';
			default:
				return theme.colors.text.primary || '#000000';
		}
	}};
	border-radius: ${({ theme }) => theme.borderRadius.sm || '4px'};
	box-shadow: ${({ theme, $variant }) => {
		switch ($variant) {
			case 'elevated':
				return theme.shadows.lg || '0 8px 16px rgba(0,0,0,0.15)';
			default:
				return theme.shadows.md || '0 4px 8px rgba(0,0,0,0.15)';
		}
	}};
	padding: ${({ theme }) => theme.spacing.xs || '4px'} 0;
	min-width: ${({ $size }) => {
		switch ($size) {
			case 'small':
				return '150px';
			case 'large':
				return '220px';
			default:
				return '180px';
		}
	}};
	max-width: 320px;
	z-index: 1000;
	border: ${({ theme, $variant }) =>
		$variant === 'light'
			? `1px solid ${theme.colors.border.default || '#e0e0e0'}`
			: 'none'};

	/* Animation for smooth appearance */
	&[data-state='open'] {
		animation: slideIn 0.2s ease-out;
	}

	&[data-state='closed'] {
		animation: slideOut 0.15s ease-in;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes slideOut {
		from {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		to {
			opacity: 0;
			transform: translateY(-4px) scale(0.95);
		}
	}
`;

/**
 * Styled dropdown menu item with hover and disabled states
 */
const StyledItem = styled(RadixDropdownMenu.Item)<{
	$variant?: 'default' | 'destructive' | 'success';
	$size: Size;
}>`
	padding: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return `${theme.spacing.xs || '4px'} ${theme.spacing.sm || '8px'}`;
			case 'large':
				return `${theme.spacing.md || '12px'} ${theme.spacing.lg || '20px'}`;
			default:
				return `${theme.spacing.sm || '8px'} ${theme.spacing.md || '16px'}`;
		}
	}};
	font-size: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return theme.typography.fontSize.xs || '12px';
			case 'large':
				return theme.typography.fontSize.md || '16px';
			default:
				return theme.typography.fontSize.sm || '14px';
		}
	}};
	cursor: pointer;
	outline: none;
	background: none;
	border: none;
	color: ${({ theme, $variant }) => {
		switch ($variant) {
			case 'destructive':
				return theme.colors.text.error || '#d32f2f';
			case 'success':
				return theme.colors.text.success || '#2e7d32';
			default:
				return 'inherit';
		}
	}};
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm || '8px'};
	width: 100%;
	text-align: left;
	user-select: none;
	position: relative;
	transition: all 0.15s ease-in-out;

	/* Icon styling within menu items */
	.menu-item-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	/* Keyboard shortcut styling */
	.menu-item-shortcut {
		margin-left: auto;
		font-size: ${({ theme }) => theme.typography.fontSize.xs || '12px'};
		color: ${({ theme }) => theme.colors.text.secondary || '#888'};
		opacity: 0.8;
	}

	/* Disabled state */
	&[data-disabled] {
		color: ${({ theme }) => theme.colors.text.secondary || '#888'};
		cursor: not-allowed;
		pointer-events: none;
		opacity: 0.5;
	}

	/* Highlighted/hover state */
	&[data-highlighted] {
		background: ${({ theme, $variant }) => {
			switch ($variant) {
				case 'destructive':
					return theme.colors.background.errorHover || '#ffebee';
				case 'success':
					return theme.colors.background.successHover || '#e8f5e8';
				default:
					return theme.colors.background.hover || '#f5f5f5';
			}
		}};
	}

	/* Focus state for accessibility */
	&:focus-visible {
		background: ${({ theme }) => theme.colors.background.hover || '#f5f5f5'};
		outline: 2px solid ${({ theme }) => theme.colors.primary || '#0077cc'};
		outline-offset: -2px;
	}
`;

/**
 * Styled separator for grouping menu items
 */
const StyledSeparator = styled(RadixDropdownMenu.Separator)`
	height: 1px;
	background: ${({ theme }) => theme.colors.border.default || '#eee'};
	margin: ${({ theme }) => theme.spacing.xs || '4px'} 0;
`;

/**
 * Styled label for menu sections
 */
const StyledLabel = styled(RadixDropdownMenu.Label)<{ $size: Size }>`
	padding: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return `${theme.spacing.xs || '4px'} ${theme.spacing.sm || '8px'}`;
			case 'large':
				return `${theme.spacing.sm || '8px'} ${theme.spacing.lg || '20px'}`;
			default:
				return `${theme.spacing.xs || '4px'} ${theme.spacing.md || '16px'}`;
		}
	}};
	font-size: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return theme.typography.fontSize.xs || '11px';
			case 'large':
				return theme.typography.fontSize.sm || '14px';
			default:
				return theme.typography.fontSize.xs || '12px';
		}
	}};
	font-weight: ${({ theme }) => theme.typography.fontWeight.medium || '500'};
	color: ${({ theme }) => theme.colors.text.secondary || '#888'};
	text-transform: uppercase;
	letter-spacing: 0.5px;
`;

/**
 * Styled sub-menu trigger for nested menus
 */
const StyledSubTrigger = styled(RadixDropdownMenu.SubTrigger)<{ $size: Size }>`
	padding: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return `${theme.spacing.xs || '4px'} ${theme.spacing.sm || '8px'}`;
			case 'large':
				return `${theme.spacing.md || '12px'} ${theme.spacing.lg || '20px'}`;
			default:
				return `${theme.spacing.sm || '8px'} ${theme.spacing.md || '16px'}`;
		}
	}};
	font-size: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return theme.typography.fontSize.xs || '12px';
			case 'large':
				return theme.typography.fontSize.md || '16px';
			default:
				return theme.typography.fontSize.sm || '14px';
		}
	}};
	cursor: pointer;
	outline: none;
	background: none;
	border: none;
	color: inherit;
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm || '8px'};
	width: 100%;
	text-align: left;
	user-select: none;
	position: relative;

	/* Arrow indicator for sub-menu */
	&::after {
		content: '▶';
		margin-left: auto;
		font-size: 10px;
		opacity: 0.7;
	}

	&[data-disabled] {
		color: ${({ theme }) => theme.colors.text.secondary || '#888'};
		cursor: not-allowed;
		pointer-events: none;
		opacity: 0.5;
	}

	&[data-highlighted] {
		background: ${({ theme }) => theme.colors.background.hover || '#f5f5f5'};
	}
`;

/**
 * Styled checkbox item for selectable options
 */
const StyledCheckboxItem = styled(RadixDropdownMenu.CheckboxItem)<{
	$size: Size;
}>`
	padding: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return `${theme.spacing.xs || '4px'} ${theme.spacing.sm || '8px'}`;
			case 'large':
				return `${theme.spacing.md || '12px'} ${theme.spacing.lg || '20px'}`;
			default:
				return `${theme.spacing.sm || '8px'} ${theme.spacing.md || '16px'}`;
		}
	}};
	font-size: ${({ theme, $size }) => {
		switch ($size) {
			case 'small':
				return theme.typography.fontSize.xs || '12px';
			case 'large':
				return theme.typography.fontSize.md || '16px';
			default:
				return theme.typography.fontSize.sm || '14px';
		}
	}};
	cursor: pointer;
	outline: none;
	background: none;
	border: none;
	color: inherit;
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing.sm || '8px'};
	width: 100%;
	text-align: left;
	user-select: none;
	position: relative;

	&[data-disabled] {
		color: ${({ theme }) => theme.colors.text.secondary || '#888'};
		cursor: not-allowed;
		pointer-events: none;
		opacity: 0.5;
	}

	&[data-highlighted] {
		background: ${({ theme }) => theme.colors.background.hover || '#f5f5f5'};
	}
`;

/**
 * Styled indicator for checkbox items
 */
const StyledItemIndicator = styled(RadixDropdownMenu.ItemIndicator)`
	width: 16px;
	height: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: ${({ theme }) => theme.spacing.xs || '4px'};

	&::after {
		content: '✓';
		font-size: 12px;
		color: ${({ theme }) => theme.colors.primary || '#0077cc'};
		font-weight: bold;
	}
`;

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
			<StyledContent
				$variant={variant}
				$size={size}
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
			</StyledContent>
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
	...props
}: DropdownMenuItemProps) => (
	<StyledItem
		$variant={variant}
		$size={size}
		disabled={disabled}
		onSelect={
			closeOnSelect
				? onSelect
				: (event) => {
						event.preventDefault();
						onSelect?.(event);
				  }
		}
		{...props}
	>
		{icon && <span className='menu-item-icon'>{icon}</span>}
		<span>{children}</span>
		{shortcut && <span className='menu-item-shortcut'>{shortcut}</span>}
	</StyledItem>
);

/**
 * DropdownMenuSeparator - Visual separator between menu sections
 */
export const DropdownMenuSeparator = StyledSeparator;

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
	...props
}: DropdownMenuLabelProps) => (
	<StyledLabel $size={size} {...props}>
		{children}
	</StyledLabel>
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
	...props
}: DropdownMenuCheckboxItemProps) => (
	<StyledCheckboxItem
		$size={size}
		checked={checked}
		onCheckedChange={onCheckedChange}
		disabled={disabled}
		{...props}
	>
		<StyledItemIndicator />
		{children}
	</StyledCheckboxItem>
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
	...props
}: DropdownMenuSubTriggerProps) => (
	<StyledSubTrigger $size={size} disabled={disabled} {...props}>
		{icon && <span className='menu-item-icon'>{icon}</span>}
		<span>{children}</span>
	</StyledSubTrigger>
);

/**
 * DropdownMenuSub - Container for nested sub-menus
 */
export const DropdownMenuSub = RadixDropdownMenu.Sub;

/**
 * DropdownMenuSubContent - Content container for sub-menus
 */
export const DropdownMenuSubContent = ({
	variant = 'default' as DropdownMenuVariant,
	size = 'medium' as Size,
	children,
	...props
}: DropdownMenuSubContentProps) => (
	<RadixDropdownMenu.Portal>
		<StyledContent
			as={RadixDropdownMenu.SubContent}
			$variant={variant}
			$size={size}
			{...props}
		>
			{children}
		</StyledContent>
	</RadixDropdownMenu.Portal>
);

// Export the root component as default
export default DropdownMenu;
