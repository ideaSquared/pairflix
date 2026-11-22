import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import clsx from 'clsx';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { lightThemeClass, themeRoot } from '../styles/theme.css';
import { expectNoAxeViolations } from '../utils/a11y-test-utils';
import {
  Alert,
  AppLayout,
  Breadcrumb,
  Button,
  Card,
  CompactPagination,
  DataTable,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  ErrorFallback,
  FilterGroup,
  FilterItem,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalFooter,
  Pagination,
  PasswordInput,
  ProviderBadges,
  QueryErrorBoundary,
  QuickFilter,
  SearchBar,
  Select,
  SimplePagination,
  SimpleTextarea,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TableActionButton,
  Tabs,
  TagFilter,
  TagInput,
  Textarea,
  Tooltip,
  type TableColumn,
} from '..';

// Imported through the package entry point, as consumers do: QueryErrorBoundary imports the
// barrel itself, so reaching it through a sub-barrel first leaves its imports half-initialised.
type Row = { id: string; name: string; role: string };

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role' },
];
const rows: Row[] = [
  { id: '1', name: 'Alex', role: 'Owner' },
  { id: '2', name: 'Sam', role: 'Member' },
];

const noop = () => undefined;

const Throws = (): ReactElement => {
  throw new Error('boom');
};

// Each case renders an exported component that puts interactive UI on screen, in the state a
// user would meet it in (overlays open, errors shown).
const cases: [name: string, ui: () => ReactElement][] = [
  ['Button', () => <Button onClick={noop}>Save</Button>],
  ['Button (loading)', () => <Button isLoading>Save</Button>],
  [
    'Input',
    () => (
      <Input label="Email" helperText="We never share it" required isInvalid />
    ),
  ],
  ['PasswordInput', () => <PasswordInput label="Password" />],
  [
    'SearchBar',
    () => <SearchBar value="dune" onChange={noop} onSearch={noop} />,
  ],
  [
    'Select',
    () => (
      <Select
        label="Mood"
        placeholder="Pick a mood"
        options={[
          { value: 'cosy', label: 'Cosy' },
          { value: 'tense', label: 'Tense' },
        ]}
      />
    ),
  ],
  ['Switch', () => <Switch label="Dark mode" onChange={noop} />],
  [
    'Textarea',
    () => (
      <Textarea
        label="Notes"
        helperText="Optional"
        maxLength={200}
        showCharacterCount
      />
    ),
  ],
  ['SimpleTextarea', () => <SimpleTextarea aria-label="Notes" />],
  [
    'TagFilter',
    () => (
      <TagFilter
        tags={['Drama', 'Comedy']}
        selectedTags={['Drama']}
        onChange={noop}
      />
    ),
  ],
  ['TagInput', () => <TagInput tags={['cosy']} onChange={noop} />],
  [
    'FilterGroup',
    () => (
      <FilterGroup
        title="Filters"
        onApply={noop}
        onClear={noop}
        defaultExpanded
      >
        <FilterItem label="Runtime" helpText="In minutes">
          <Input aria-label="Runtime" />
        </FilterItem>
        <QuickFilter
          label="Type"
          value="movie"
          onChange={noop}
          options={[
            { label: 'Movie', value: 'movie' },
            { label: 'Series', value: 'tv' },
          ]}
        />
      </FilterGroup>
    ),
  ],
  [
    'Breadcrumb',
    () => (
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'History', href: '/history' },
          { label: 'Dune' },
        ]}
      />
    ),
  ],
  ['Link', () => <Link href="/history">History</Link>],
  [
    'Link (external)',
    () => (
      <Link href="https://example.com" external>
        Docs
      </Link>
    ),
  ],
  [
    'Pagination',
    () => (
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={noop}
        showFirstLast
      />
    ),
  ],
  [
    'SimplePagination',
    () => (
      <SimplePagination currentPage={2} totalPages={5} onPageChange={noop} />
    ),
  ],
  [
    'CompactPagination',
    () => (
      <CompactPagination currentPage={2} totalPages={5} onPageChange={noop} />
    ),
  ],
  [
    'Tabs',
    () => (
      <Tabs defaultValue="one">
        <TabList>
          <Tab value="one">One</Tab>
          <Tab value="two">Two</Tab>
          <Tab value="three" disabled>
            Three
          </Tab>
        </TabList>
        <TabPanel value="one">First panel</TabPanel>
        <TabPanel value="two">Second panel</TabPanel>
        <TabPanel value="three">Third panel</TabPanel>
      </Tabs>
    ),
  ],
  [
    'DropdownMenu (open)',
    () => (
      <DropdownMenu trigger={<Button>Account</Button>} defaultOpen>
        <DropdownMenuLabel>Signed in</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={noop}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={noop} variant="destructive">
          Log out
        </DropdownMenuItem>
      </DropdownMenu>
    ),
  ],
  [
    'Modal (open)',
    () => (
      <Modal isOpen onClose={noop} title="Invite a member">
        <ModalBody>
          <Input label="Invite email" />
        </ModalBody>
        <ModalFooter>
          <Button onClick={noop}>Send</Button>
        </ModalFooter>
      </Modal>
    ),
  ],
  [
    'Tooltip (open)',
    () => (
      <Tooltip content="Picks left this week" open>
        <Button>Picks</Button>
      </Tooltip>
    ),
  ],
  [
    'Alert (dismissible)',
    () => (
      <Alert
        variant="warning"
        message="Heads up"
        description="Details"
        dismissible
        onDismiss={noop}
      />
    ),
  ],
  [
    'DataTable',
    () => (
      <DataTable
        aria-label="Household members"
        columns={columns}
        data={rows}
        onSort={noop}
        sortColumn="name"
        sortDirection="asc"
        onRowClick={noop}
        getRowId={row => row.id}
        rowActions={row => (
          <TableActionButton title={`Remove ${row.name}`}>
            Remove
          </TableActionButton>
        )}
      />
    ),
  ],
  [
    'DataTable (selectable)',
    () => (
      <DataTable
        aria-label="Household members"
        columns={columns}
        data={rows}
        selectable
        selectedRows={['1']}
        onRowSelect={noop}
        getRowId={row => row.id}
        rowActions={row => (
          <TableActionButton title={`Remove ${row.name}`}>
            Remove
          </TableActionButton>
        )}
      />
    ),
  ],
  [
    'Card (interactive)',
    () => (
      <Card isInteractive>
        <p>Tonight&apos;s pick</p>
      </Card>
    ),
  ],
  [
    'ProviderBadges (linked)',
    () => (
      <ProviderBadges
        providers={[
          { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png' },
          { provider_id: 9, provider_name: 'Prime Video', logo_path: null },
        ]}
        deepLink="https://example.com/watch"
      />
    ),
  ],
  [
    'ErrorFallback',
    () => <ErrorFallback error={new Error('boom')} resetErrorBoundary={noop} />,
  ],
  [
    'QueryErrorBoundary (error shown)',
    () => (
      <QueryErrorBoundary>
        <Throws />
      </QueryErrorBoundary>
    ),
  ],
  [
    'AppLayout (client)',
    () => (
      <AppLayout
        variant="client"
        navigation={{
          sections: [
            {
              items: [
                { key: 'tonight', label: 'Tonight', path: '/' },
                { key: 'history', label: 'History', path: '/history' },
              ],
            },
          ],
          user: {
            name: 'Alex',
            initials: 'A',
            menu: [{ key: 'logout', label: 'Log out', path: '/logout' }],
          },
        }}
        footer={{ show: true, content: <p>Footer</p> }}
      >
        <h1>Tonight</h1>
      </AppLayout>
    ),
  ],
  [
    'AppLayout (admin)',
    () => (
      <AppLayout
        variant="admin"
        header={{ title: 'Admin' }}
        navigation={{
          sections: [
            {
              title: 'Manage',
              items: [{ key: 'users', label: 'Users', path: '/users' }],
            },
          ],
          user: { name: 'Admin', initials: 'AD' },
        }}
      >
        <h1>Users</h1>
      </AppLayout>
    ),
  ],
];

const renderWithProviders = (ui: ReactElement) =>
  render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <div className={clsx(lightThemeClass, themeRoot)}>{ui}</div>
      </QueryClientProvider>
    </MemoryRouter>
  );

describe('component accessibility (axe, WCAG 2.2 AA)', () => {
  beforeEach(() => {
    // QueryErrorBoundary's case throws on purpose; keep React's error report out of the output.
    vi.spyOn(console, 'error').mockImplementation(noop);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(cases)('%s has no axe violations', async (name, ui) => {
    const { baseElement } = renderWithProviders(ui());

    // baseElement, not container: overlays (Modal, DropdownMenu, Tooltip) portal into <body>.
    await expectNoAxeViolations(baseElement, name);
  });
});
