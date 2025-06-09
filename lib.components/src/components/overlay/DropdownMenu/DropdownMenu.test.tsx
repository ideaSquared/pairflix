import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
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

// Mock theme provider wrapper
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{component}</ThemeProvider>);
};

// Mock icons for testing
const EditIcon = () => <span data-testid="edit-icon">✏️</span>;
const SaveIcon = () => <span data-testid="save-icon">💾</span>;
const DeleteIcon = () => <span data-testid="delete-icon">🗑️</span>;
const FolderIcon = () => <span data-testid="folder-icon">📁</span>;

describe('DropdownMenu', () => {
  describe('Basic Functionality', () => {
    it('renders trigger element correctly', () => {
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>}>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      expect(
        screen.getByRole('button', { name: 'Open Menu' })
      ).toBeInTheDocument();
    });

    it('opens menu when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>}>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <div>
          <DropdownMenu trigger={<Button>Open Menu</Button>}>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenu>
          <div data-testid="outside">Outside</div>
        </div>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });

    it('supports controlled open state', () => {
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>} open={true}>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('calls onOpenChange when menu state changes', async () => {
      const onOpenChange = jest.fn();
      const user = userEvent.setup();

      renderWithTheme(
        <DropdownMenu
          trigger={<Button>Open Menu</Button>}
          onOpenChange={onOpenChange}
        >
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Variants and Sizing', () => {
    it('renders with default variant', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>}>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        const menu = screen
          .getByText('Item 1')
          .closest('[data-radix-popper-content-wrapper]');
        expect(menu).toBeInTheDocument();
      });
    });

    it('renders with dark variant', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>} variant="dark">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('renders with elevated variant', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>} variant="elevated">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('renders with small size', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>} size="small">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('renders with large size', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>} size="large">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });
  });

  describe('Positioning Options', () => {
    it('renders with different alignment options', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>} align="center">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('renders with different side options', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>} side="right">
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });

    it('applies custom offset values', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu
          trigger={<Button>Open Menu</Button>}
          sideOffset={10}
          alignOffset={5}
        >
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation with arrow keys', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>}>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      // Test arrow key navigation
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
    });

    it('closes on Escape key', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <DropdownMenu trigger={<Button>Open Menu</Button>}>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Open Menu' }));
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      });
    });
  });
});

describe('DropdownMenuItem', () => {
  it('renders with icon and shortcut', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem icon={<EditIcon />} shortcut="⌘E">
          Edit
        </DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByText('⌘E')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('handles click events', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem onSelect={onSelect}>Click me</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Click me'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders with destructive variant', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('renders with success variant', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem variant="success">Success</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  it('supports disabled state', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem disabled onSelect={onSelect}>
          Disabled Item
        </DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      const item = screen.getByText('Disabled Item');
      expect(item).toBeInTheDocument();
      // The data-disabled attribute is on the parent menuitem element
      const menuItem = item.closest('[role="menuitem"]');
      expect(menuItem).toHaveAttribute('data-disabled');
    });
  });

  it('supports different sizes', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem size="small">Small Item</DropdownMenuItem>
        <DropdownMenuItem size="large">Large Item</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Small Item')).toBeInTheDocument();
      expect(screen.getByText('Large Item')).toBeInTheDocument();
    });
  });

  it('supports closeOnSelect=false', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem closeOnSelect={false} onSelect={onSelect}>
          Stay Open
        </DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Stay Open')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Stay Open'));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe('DropdownMenuLabel', () => {
  it('renders section labels correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuLabel>File Operations</DropdownMenuLabel>
        <DropdownMenuItem>Save</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('File Operations')).toBeInTheDocument();
    });
  });

  it('supports different sizes', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuLabel size="large">Large Label</DropdownMenuLabel>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Large Label')).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuSeparator', () => {
  it('renders separators correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Item 2</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      // Separator should be present in DOM
      const separator = screen.getByRole('separator');
      expect(separator).toBeInTheDocument();
    });
  });
});

describe('DropdownMenuCheckboxItem', () => {
  it('renders checkbox items correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuCheckboxItem checked={true}>
          Show Sidebar
        </DropdownMenuCheckboxItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      const checkboxItem = screen.getByRole('menuitemcheckbox');
      expect(checkboxItem).toBeInTheDocument();
      expect(checkboxItem).toHaveAttribute('data-state', 'checked');
    });
  });

  it('handles checkbox state changes', async () => {
    const onCheckedChange = jest.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuCheckboxItem
          checked={false}
          onCheckedChange={onCheckedChange}
        >
          Toggle Option
        </DropdownMenuCheckboxItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByRole('menuitemcheckbox')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('menuitemcheckbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('supports disabled state', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuCheckboxItem disabled>
          Disabled Checkbox
        </DropdownMenuCheckboxItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      const checkboxItem = screen.getByRole('menuitemcheckbox');
      expect(checkboxItem).toHaveAttribute('data-disabled');
    });
  });
});

describe('DropdownMenuSub', () => {
  it('renders sub-menus correctly', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<FolderIcon />}>
            Export
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Export as PDF</DropdownMenuItem>
            <DropdownMenuItem>Export as CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
    });

    // Hover over sub-trigger to open sub-menu
    await user.hover(screen.getByText('Export'));
    await waitFor(() => {
      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    });
  });

  it('supports disabled sub-triggers', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled>Disabled Sub</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Open Menu' }));
    await waitFor(() => {
      const subTrigger = screen.getByText('Disabled Sub');
      // The data-disabled attribute is on the parent menuitem element
      const menuItem = subTrigger.closest('[role="menuitem"]');
      expect(menuItem).toHaveAttribute('data-disabled');
    });
  });
});

describe('Accessibility', () => {
  it('has proper ARIA attributes', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button', { name: 'Open Menu' });
    expect(trigger).toHaveAttribute('data-state', 'closed');

    await user.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  it('supports focus management', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <DropdownMenu trigger={<Button>Open Menu</Button>}>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuItem>Item 2</DropdownMenuItem>
      </DropdownMenu>
    );

    await user.tab(); // Focus the trigger
    await user.keyboard('{Enter}'); // Open menu

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });
});

describe('Complex Menu Examples', () => {
  it('renders a complete menu with all features', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    const onDelete = jest.fn();

    renderWithTheme(
      <DropdownMenu
        trigger={<Button>Actions</Button>}
        variant="elevated"
        size="large"
      >
        <DropdownMenuLabel>File Operations</DropdownMenuLabel>
        <DropdownMenuItem icon={<SaveIcon />} shortcut="⌘S" onSelect={onSave}>
          Save
        </DropdownMenuItem>
        <DropdownMenuItem icon={<EditIcon />}>Edit</DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem checked={false}>
          Show Sidebar
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<FolderIcon />}>
            Export
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          icon={<DeleteIcon />}
          onSelect={onDelete}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenu>
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => {
      expect(screen.getByText('File Operations')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('⌘S')).toBeInTheDocument();
      expect(screen.getByTestId('save-icon')).toBeInTheDocument();
      expect(screen.getByRole('menuitemcheckbox')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });
});
