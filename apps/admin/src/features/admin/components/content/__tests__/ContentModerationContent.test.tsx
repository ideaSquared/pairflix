import userEvent from '@testing-library/user-event';
import { admin } from '../../../../../services/api';
import type {
  AdminContentSummary,
  ContentReport,
} from '../../../../../services/api/admin';
import { render, screen, waitFor, within } from '../../../../../tests/setup';
import ContentModerationContent from '../ContentModerationContent';

// The shared component mock doesn't cover everything this page uses yet
// (Badge, Flex, Typography, the Table family, ...) -- see pairflixComponentsMock.tsx.
jest.mock('@pairflix/components', () =>
  jest.requireActual('./pairflixComponentsMock')
);

jest.mock('../../../../../services/api', () =>
  jest.requireActual('../../../../../tests/__mocks__/api')
);

const mockContentItems: AdminContentSummary[] = [
  {
    id: 'content-1',
    title: 'The Great Movie',
    type: 'movie',
    status: 'flagged',
    reportedCount: 3,
    removalReason: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'content-2',
    title: 'A Fine Show',
    type: 'show',
    status: 'active',
    reportedCount: 0,
    removalReason: null,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
];

const mockReports: ContentReport[] = [
  {
    id: 'report-1',
    reason: 'Inappropriate content',
    details: 'Contains spoilers',
    status: 'pending',
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-01-05T00:00:00.000Z',
    reporterUsername: 'reporter1',
  },
];

const getRow = (title: string): HTMLElement => {
  const row = screen.getByText(title).closest('tr');
  if (!row) throw new Error(`row for "${title}" not found`);
  return row as HTMLElement;
};

const renderAndWaitForRows = async () => {
  render(<ContentModerationContent />);
  await waitFor(() => {
    expect(screen.getByText('The Great Movie')).toBeInTheDocument();
  });
};

describe('ContentModerationContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (admin.content.list as jest.Mock).mockResolvedValue({
      data: mockContentItems,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
    (admin.content.reports as jest.Mock).mockResolvedValue(mockReports);
  });

  it('renders a row for each fetched content item', async () => {
    await renderAndWaitForRows();

    expect(screen.getByText('A Fine Show')).toBeInTheDocument();

    const row = getRow('The Great Movie');
    expect(within(row).getByText('movie')).toBeInTheDocument();
    expect(within(row).getByText('flagged')).toBeInTheDocument();
    expect(within(row).getByText('3')).toBeInTheDocument();
  });

  it('opens the Edit dialog for the clicked row, pre-filled with its content', async () => {
    const user = userEvent.setup();
    await renderAndWaitForRows();

    const row = getRow('The Great Movie');
    await user.click(within(row).getByText('Edit'));

    const dialog = await screen.findByRole('dialog', {
      name: 'Edit Content',
    });
    expect(
      within(dialog).getByDisplayValue('The Great Movie')
    ).toBeInTheDocument();
  });

  it('opens the Remove dialog for the clicked row', async () => {
    const user = userEvent.setup();
    await renderAndWaitForRows();

    const row = getRow('A Fine Show');
    await user.click(within(row).getByText('Remove'));

    const dialog = await screen.findByRole('dialog', {
      name: 'Remove Content',
    });
    expect(within(dialog).getByText(/A Fine Show/)).toBeInTheDocument();
  });

  it('opens the Review Reports dialog and loads reports for the clicked row', async () => {
    const user = userEvent.setup();
    await renderAndWaitForRows();

    const row = getRow('The Great Movie');
    await user.click(within(row).getByText('Review Reports'));

    const dialog = await screen.findByRole('dialog', {
      name: 'Review Reports',
    });
    expect(admin.content.reports).toHaveBeenCalledWith('content-1');
    await waitFor(() => {
      expect(
        within(dialog).getByText(/Inappropriate content/)
      ).toBeInTheDocument();
    });
  });
});
