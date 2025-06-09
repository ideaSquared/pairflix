import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { ThemeProvider } from 'styled-components';
import mockTheme from '../../../__mocks__/mockTheme';
import { Breadcrumb } from './Breadcrumb';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);
};

describe('Breadcrumb Component', () => {
  describe('Basic Rendering', () => {
    it('renders with single item', () => {
      renderWithTheme(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('renders multiple items with separators', () => {
      renderWithTheme(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Item', href: '/products/item' },
          ]}
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Item')).toBeInTheDocument();
      // Should have 2 separators for 3 items
      expect(screen.getAllByText('/')).toHaveLength(2);
    });

    it('applies custom className', () => {
      renderWithTheme(
        <Breadcrumb
          className="custom-breadcrumb"
          items={[{ label: 'Home', href: '/' }]}
        />
      );
      expect(screen.getByRole('navigation')).toHaveClass('custom-breadcrumb');
    });

    it('forwards ref correctly', () => {
      const ref = createRef<HTMLElement>();
      renderWithTheme(
        <Breadcrumb ref={ref} items={[{ label: 'Home', href: '/' }]} />
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Item Behavior', () => {
    it('renders last item as current', () => {
      renderWithTheme(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Current', href: '/current' },
          ]}
        />
      );

      const currentItem = screen.getByText('Current');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('renders items as links when href is provided', () => {
      renderWithTheme(
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
        />
      );

      const link = screen.getByRole('link', { name: 'Home' });
      expect(link).toHaveAttribute('href', '/');
    });

    it('handles truncation properly', () => {
      renderWithTheme(
        <Breadcrumb
          maxItems={3}
          items={[
            { label: 'First', href: '/first' },
            { label: 'Second', href: '/second' },
            { label: 'Third', href: '/third' },
            { label: 'Fourth', href: '/fourth' },
            { label: 'Fifth', href: '/fifth' },
          ]}
        />
      );

      expect(screen.getByText('...')).toBeInTheDocument();
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Fourth')).toBeInTheDocument();
      expect(screen.getByText('Fifth')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper navigation landmark', () => {
      renderWithTheme(<Breadcrumb items={[{ label: 'Home', href: '/' }]} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('has aria-label for navigation', () => {
      renderWithTheme(
        <Breadcrumb
          aria-label="Custom breadcrumb"
          items={[{ label: 'Home', href: '/' }]}
        />
      );
      expect(screen.getByRole('navigation')).toHaveAttribute(
        'aria-label',
        'Custom breadcrumb'
      );
    });

    it('uses ordered list for breadcrumb items', () => {
      renderWithTheme(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
          ]}
        />
      );
      expect(screen.getByRole('list')).toHaveAttribute('role', 'list');
    });

    it('has proper list item roles', () => {
      renderWithTheme(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
          ]}
        />
      );
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('Custom Separator', () => {
    it('renders custom separator', () => {
      renderWithTheme(
        <Breadcrumb
          separator=">"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
          ]}
        />
      );
      expect(screen.getByText('>')).toBeInTheDocument();
    });

    it('renders custom separator component', () => {
      renderWithTheme(
        <Breadcrumb
          separator={<span>→</span>}
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
          ]}
        />
      );
      expect(screen.getByText('→')).toBeInTheDocument();
    });
  });
});
