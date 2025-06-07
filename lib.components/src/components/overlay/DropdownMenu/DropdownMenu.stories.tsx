import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '../../inputs/Button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from './DropdownMenu';

// Mock icons for stories
const EditIcon = () => <span>✏️</span>;
const SaveIcon = () => <span>💾</span>;
const DeleteIcon = () => <span>🗑️</span>;
const FolderIcon = () => <span>📁</span>;
const SettingsIcon = () => <span>⚙️</span>;
const UserIcon = () => <span>👤</span>;
const LogoutIcon = () => <span>🚪</span>;
const CopyIcon = () => <span>📋</span>;
const PrintIcon = () => <span>🖨️</span>;
const ShareIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>⬇️</span>;

const meta: Meta<typeof DropdownMenu> = {
	title: 'Overlay/DropdownMenu',
	component: DropdownMenu,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
# DropdownMenu

A flexible and accessible dropdown menu component built on Radix UI primitives.

## Features

- **Multiple Variants**: Default, dark, light, and elevated styling options
- **Flexible Sizing**: Small, medium, and large size options
- **Advanced Positioning**: Configurable alignment, side positioning, and collision detection
- **Rich Content**: Support for icons, keyboard shortcuts, labels, separators, and nested sub-menus
- **Interactive Elements**: Checkbox items for toggleable options
- **Full Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **Smooth Animations**: Built-in entrance and exit animations

## Usage

Import the components you need from the DropdownMenu module:

\`\`\`tsx
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/overlay/DropdownMenu';
\`\`\`
				`,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['default', 'dark', 'light', 'elevated'],
			description: 'Visual variant of the dropdown menu',
		},
		size: {
			control: { type: 'select' },
			options: ['small', 'medium', 'large'],
			description: 'Size of the dropdown menu and its items',
		},
		align: {
			control: { type: 'select' },
			options: ['start', 'center', 'end'],
			description: 'Alignment of the dropdown content relative to the trigger',
		},
		side: {
			control: { type: 'select' },
			options: ['top', 'right', 'bottom', 'left'],
			description: 'Side where the dropdown should appear',
		},
		modal: {
			control: { type: 'boolean' },
			description: 'Whether the dropdown should be modal',
		},
		sideOffset: {
			control: { type: 'number', min: 0, max: 50 },
			description: 'Distance in pixels from the trigger',
		},
		alignOffset: {
			control: { type: 'number', min: -50, max: 50 },
			description: 'Distance in pixels from the align edge',
		},
	},
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

// Basic Examples
export const Basic: Story = {
	args: {
		variant: 'default',
		size: 'medium',
		align: 'start',
		side: 'bottom',
		sideOffset: 4,
		alignOffset: 0,
	},
	render: (args) => (
		<DropdownMenu {...args} trigger={<Button>Open Menu</Button>}>
			<DropdownMenuItem>Profile</DropdownMenuItem>
			<DropdownMenuItem>Settings</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem>Logout</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const WithIcons: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>Actions</Button>}>
			<DropdownMenuItem icon={<EditIcon />}>Edit</DropdownMenuItem>
			<DropdownMenuItem icon={<CopyIcon />}>Copy</DropdownMenuItem>
			<DropdownMenuItem icon={<ShareIcon />}>Share</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem icon={<DeleteIcon />} variant='destructive'>
				Delete
			</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const WithShortcuts: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>File</Button>}>
			<DropdownMenuItem icon={<SaveIcon />} shortcut='⌘S'>
				Save
			</DropdownMenuItem>
			<DropdownMenuItem icon={<CopyIcon />} shortcut='⌘C'>
				Copy
			</DropdownMenuItem>
			<DropdownMenuItem icon={<PrintIcon />} shortcut='⌘P'>
				Print
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem icon={<DownloadIcon />} shortcut='⌘⇧S'>
				Save As...
			</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const WithLabels: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>Account</Button>}>
			<DropdownMenuLabel>Account</DropdownMenuLabel>
			<DropdownMenuItem icon={<UserIcon />}>Profile</DropdownMenuItem>
			<DropdownMenuItem icon={<SettingsIcon />}>Settings</DropdownMenuItem>

			<DropdownMenuSeparator />

			<DropdownMenuLabel>Actions</DropdownMenuLabel>
			<DropdownMenuItem icon={<EditIcon />}>Edit Profile</DropdownMenuItem>
			<DropdownMenuItem icon={<ShareIcon />}>Share Profile</DropdownMenuItem>

			<DropdownMenuSeparator />

			<DropdownMenuItem icon={<LogoutIcon />}>Sign Out</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const WithCheckboxItems: Story = {
	render: () => {
		const [showSidebar, setShowSidebar] = React.useState(true);
		const [showToolbar, setShowToolbar] = React.useState(false);
		const [showStatusBar, setShowStatusBar] = React.useState(true);

		return (
			<DropdownMenu trigger={<Button>View</Button>}>
				<DropdownMenuLabel>Layout</DropdownMenuLabel>
				<DropdownMenuCheckboxItem
					checked={showSidebar}
					onCheckedChange={setShowSidebar}
				>
					Show Sidebar
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={showToolbar}
					onCheckedChange={setShowToolbar}
				>
					Show Toolbar
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={showStatusBar}
					onCheckedChange={setShowStatusBar}
				>
					Show Status Bar
				</DropdownMenuCheckboxItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem icon={<SettingsIcon />}>
					Layout Settings
				</DropdownMenuItem>
			</DropdownMenu>
		);
	},
};

export const WithSubMenus: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>Export</Button>}>
			<DropdownMenuLabel>Export Options</DropdownMenuLabel>

			<DropdownMenuSub>
				<DropdownMenuSubTrigger icon={<FolderIcon />}>
					Document Formats
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent>
					<DropdownMenuItem>Export as PDF</DropdownMenuItem>
					<DropdownMenuItem>Export as Word</DropdownMenuItem>
					<DropdownMenuItem>Export as HTML</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuSub>

			<DropdownMenuSub>
				<DropdownMenuSubTrigger icon={<FolderIcon />}>
					Image Formats
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent>
					<DropdownMenuItem>Export as PNG</DropdownMenuItem>
					<DropdownMenuItem>Export as JPG</DropdownMenuItem>
					<DropdownMenuItem>Export as SVG</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuSub>

			<DropdownMenuSeparator />

			<DropdownMenuItem icon={<SettingsIcon />}>
				Export Settings
			</DropdownMenuItem>
		</DropdownMenu>
	),
};

// Variant Examples
export const DarkVariant: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>Dark Menu</Button>} variant='dark'>
			<DropdownMenuLabel>Dark Theme</DropdownMenuLabel>
			<DropdownMenuItem icon={<EditIcon />}>Edit</DropdownMenuItem>
			<DropdownMenuItem icon={<ShareIcon />}>Share</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem icon={<DeleteIcon />} variant='destructive'>
				Delete
			</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const LightVariant: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>Light Menu</Button>} variant='light'>
			<DropdownMenuLabel>Light Theme</DropdownMenuLabel>
			<DropdownMenuItem icon={<EditIcon />}>Edit</DropdownMenuItem>
			<DropdownMenuItem icon={<ShareIcon />}>Share</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem icon={<DeleteIcon />} variant='destructive'>
				Delete
			</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const ElevatedVariant: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>Elevated Menu</Button>} variant='elevated'>
			<DropdownMenuLabel>Elevated Style</DropdownMenuLabel>
			<DropdownMenuItem icon={<EditIcon />}>Edit</DropdownMenuItem>
			<DropdownMenuItem icon={<ShareIcon />}>Share</DropdownMenuItem>
			<DropdownMenuSeparator />
			<DropdownMenuItem icon={<DeleteIcon />} variant='destructive'>
				Delete
			</DropdownMenuItem>
		</DropdownMenu>
	),
};

// Size Examples
export const SmallSize: Story = {
	render: () => (
		<DropdownMenu
			trigger={<Button size='small'>Small Menu</Button>}
			size='small'
		>
			<DropdownMenuLabel>Small Size</DropdownMenuLabel>
			<DropdownMenuItem icon={<EditIcon />}>Edit</DropdownMenuItem>
			<DropdownMenuItem icon={<ShareIcon />}>Share</DropdownMenuItem>
			<DropdownMenuItem icon={<DeleteIcon />}>Delete</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const LargeSize: Story = {
	render: () => (
		<DropdownMenu
			trigger={<Button size='large'>Large Menu</Button>}
			size='large'
		>
			<DropdownMenuLabel>Large Size</DropdownMenuLabel>
			<DropdownMenuItem icon={<EditIcon />}>Edit</DropdownMenuItem>
			<DropdownMenuItem icon={<ShareIcon />}>Share</DropdownMenuItem>
			<DropdownMenuItem icon={<DeleteIcon />}>Delete</DropdownMenuItem>
		</DropdownMenu>
	),
};

// Positioning Examples
export const DifferentPositions: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
			<DropdownMenu trigger={<Button>Bottom</Button>} side='bottom'>
				<DropdownMenuItem>Bottom positioned</DropdownMenuItem>
			</DropdownMenu>

			<DropdownMenu trigger={<Button>Top</Button>} side='top'>
				<DropdownMenuItem>Top positioned</DropdownMenuItem>
			</DropdownMenu>

			<DropdownMenu trigger={<Button>Right</Button>} side='right'>
				<DropdownMenuItem>Right positioned</DropdownMenuItem>
			</DropdownMenu>

			<DropdownMenu trigger={<Button>Left</Button>} side='left'>
				<DropdownMenuItem>Left positioned</DropdownMenuItem>
			</DropdownMenu>
		</div>
	),
};

export const DifferentAlignments: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
			<DropdownMenu trigger={<Button>Start Aligned</Button>} align='start'>
				<DropdownMenuItem>Start alignment</DropdownMenuItem>
				<DropdownMenuItem>This menu aligns to the start</DropdownMenuItem>
			</DropdownMenu>

			<DropdownMenu trigger={<Button>Center Aligned</Button>} align='center'>
				<DropdownMenuItem>Center alignment</DropdownMenuItem>
				<DropdownMenuItem>This menu is centered</DropdownMenuItem>
			</DropdownMenu>

			<DropdownMenu trigger={<Button>End Aligned</Button>} align='end'>
				<DropdownMenuItem>End alignment</DropdownMenuItem>
				<DropdownMenuItem>This menu aligns to the end</DropdownMenuItem>
			</DropdownMenu>
		</div>
	),
};

// Item Variant Examples
export const ItemVariants: Story = {
	render: () => (
		<DropdownMenu trigger={<Button>Item Variants</Button>}>
			<DropdownMenuLabel>Different Item Types</DropdownMenuLabel>

			<DropdownMenuItem variant='default'>Default Item</DropdownMenuItem>
			<DropdownMenuItem variant='success' icon={<SaveIcon />}>
				Success Item
			</DropdownMenuItem>
			<DropdownMenuItem variant='destructive' icon={<DeleteIcon />}>
				Destructive Item
			</DropdownMenuItem>

			<DropdownMenuSeparator />

			<DropdownMenuItem disabled>Disabled Item</DropdownMenuItem>
		</DropdownMenu>
	),
};

// Complex Real-World Examples
export const ContextMenu: Story = {
	render: () => {
		const [isBookmarked, setIsBookmarked] = React.useState(false);
		const [isPrivate, setIsPrivate] = React.useState(false);

		return (
			<DropdownMenu
				trigger={<Button>Right Click Menu</Button>}
				variant='elevated'
			>
				<DropdownMenuLabel>Context Actions</DropdownMenuLabel>

				<DropdownMenuItem icon={<EditIcon />} shortcut='⌘E'>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem icon={<CopyIcon />} shortcut='⌘C'>
					Copy Link
				</DropdownMenuItem>
				<DropdownMenuItem icon={<ShareIcon />} shortcut='⌘⇧S'>
					Share
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuCheckboxItem
					checked={isBookmarked}
					onCheckedChange={setIsBookmarked}
				>
					Bookmark
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={isPrivate}
					onCheckedChange={setIsPrivate}
				>
					Make Private
				</DropdownMenuCheckboxItem>

				<DropdownMenuSeparator />

				<DropdownMenuSub>
					<DropdownMenuSubTrigger icon={<FolderIcon />}>
						Move to
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>Projects</DropdownMenuItem>
						<DropdownMenuItem>Archive</DropdownMenuItem>
						<DropdownMenuItem>Trash</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				<DropdownMenuItem icon={<DeleteIcon />} variant='destructive'>
					Delete
				</DropdownMenuItem>
			</DropdownMenu>
		);
	},
};

export const UserProfileMenu: Story = {
	render: () => (
		<DropdownMenu
			trigger={
				<Button variant='secondary'>
					<UserIcon /> John Doe
				</Button>
			}
			align='end'
		>
			<DropdownMenuLabel>john.doe@example.com</DropdownMenuLabel>

			<DropdownMenuItem icon={<UserIcon />}>View Profile</DropdownMenuItem>
			<DropdownMenuItem icon={<SettingsIcon />}>
				Account Settings
			</DropdownMenuItem>

			<DropdownMenuSeparator />

			<DropdownMenuSub>
				<DropdownMenuSubTrigger icon={<FolderIcon />}>
					Switch Account
				</DropdownMenuSubTrigger>
				<DropdownMenuSubContent>
					<DropdownMenuItem>Personal Account</DropdownMenuItem>
					<DropdownMenuItem>Work Account</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Add Account</DropdownMenuItem>
				</DropdownMenuSubContent>
			</DropdownMenuSub>

			<DropdownMenuSeparator />

			<DropdownMenuItem icon={<LogoutIcon />}>Sign Out</DropdownMenuItem>
		</DropdownMenu>
	),
};

export const ApplicationMenu: Story = {
	render: () => {
		const [autoSave, setAutoSave] = React.useState(true);
		const [showGrid, setShowGrid] = React.useState(false);
		const [snapToGrid, setSnapToGrid] = React.useState(true);

		return (
			<div style={{ display: 'flex', gap: '0.5rem' }}>
				<DropdownMenu trigger={<Button variant='text'>File</Button>}>
					<DropdownMenuItem icon={<SaveIcon />} shortcut='⌘N'>
						New File
					</DropdownMenuItem>
					<DropdownMenuItem icon={<FolderIcon />} shortcut='⌘O'>
						Open File
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem icon={<SaveIcon />} shortcut='⌘S'>
						Save
					</DropdownMenuItem>
					<DropdownMenuItem shortcut='⌘⇧S'>Save As...</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem icon={<PrintIcon />} shortcut='⌘P'>
						Print
					</DropdownMenuItem>
				</DropdownMenu>

				<DropdownMenu trigger={<Button variant='text'>View</Button>}>
					<DropdownMenuLabel>Display Options</DropdownMenuLabel>
					<DropdownMenuCheckboxItem
						checked={showGrid}
						onCheckedChange={setShowGrid}
					>
						Show Grid
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						checked={snapToGrid}
						onCheckedChange={setSnapToGrid}
					>
						Snap to Grid
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						checked={autoSave}
						onCheckedChange={setAutoSave}
					>
						Auto Save
					</DropdownMenuCheckboxItem>
				</DropdownMenu>

				<DropdownMenu trigger={<Button variant='text'>Tools</Button>}>
					<DropdownMenuItem icon={<SettingsIcon />}>
						Preferences
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Import</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem>Import CSV</DropdownMenuItem>
							<DropdownMenuItem>Import JSON</DropdownMenuItem>
							<DropdownMenuItem>Import XML</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem>Export as PDF</DropdownMenuItem>
							<DropdownMenuItem>Export as PNG</DropdownMenuItem>
							<DropdownMenuItem>Export as SVG</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenu>
			</div>
		);
	},
};
