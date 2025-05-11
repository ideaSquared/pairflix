import userEvent from '@testing-library/user-event';
import { matches as matchesApi, watchlist } from '../../../services/api';
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '../../../tests/setup';
import MatchPage from '../MatchPage';

// Mock the API module
jest.mock('../../../services/api', () => {
	const originalModule = jest.requireActual('../../../services/api');
	return {
		...originalModule,
		matches: {
			...originalModule.matches,
			getAll: jest.fn(),
			updateStatus: jest.fn(),
		},
		watchlist: {
			...originalModule.watchlist,
			getMatches: jest.fn(),
		},
	};
});

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
	useAuth: jest.fn().mockReturnValue({
		user: { user_id: 'user-1', email: 'test@example.com' },
		isAuthenticated: true,
	}),
}));

// Mock the InviteUser component to simplify testing
jest.mock('../InviteUser', () => {
	return function MockInviteUser({ onSuccess }: { onSuccess: () => void }) {
		return (
			<div data-testid='invite-user-component'>
				<button onClick={onSuccess}>Mock Invite Success</button>
			</div>
		);
	};
});

// Mock the QueryClient to properly handle invalidations
jest.mock('@tanstack/react-query', () => {
	const actual = jest.requireActual('@tanstack/react-query');
	return {
		...actual,
		useQueryClient: () => ({
			invalidateQueries: jest.fn(),
			cancelQueries: jest.fn(),
			getQueryData: jest.fn(),
			setQueryData: jest.fn(),
		}),
	};
});

describe('MatchPage', () => {
	const mockUserMatches = [
		{
			match_id: 'match-1',
			user1_id: 'user-2',
			user2_id: 'user-1',
			status: 'pending',
			user1: { email: 'sender@example.com' },
			user2: { email: 'test@example.com' },
		},
		{
			match_id: 'match-2',
			user1_id: 'user-1',
			user2_id: 'user-3',
			status: 'accepted',
			user1: { email: 'test@example.com' },
			user2: { email: 'partner@example.com' },
		},
	];

	const mockContentMatches = [
		{
			tmdb_id: 123,
			media_type: 'movie',
			title: 'Test Movie',
			poster_path: '/test-movie-path.jpg',
			overview: 'This is a test movie overview',
			user1_status: 'to_watch_together',
			user2_status: 'would_like_to_watch_together',
		},
		{
			tmdb_id: 456,
			media_type: 'tv',
			title: 'Test TV Show',
			poster_path: '/test-tv-path.jpg',
			overview: 'This is a test TV show overview',
			user1_status: 'watching',
			user2_status: 'watching',
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		(matchesApi.getAll as jest.Mock).mockResolvedValue(mockUserMatches);
		(watchlist.getMatches as jest.Mock).mockResolvedValue(mockContentMatches);
		(matchesApi.updateStatus as jest.Mock).mockImplementation((id, status) => {
			return Promise.resolve({
				match_id: id,
				status: status,
			});
		});
	});

	it('renders the matches page with loading state initially', () => {
		render(<MatchPage />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('displays pending match requests', async () => {
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Match Requests (1)')).toBeInTheDocument();
		});

		// Verify pending match details
		expect(screen.getByText('From: sender@example.com')).toBeInTheDocument();
		expect(screen.getByText('Accept')).toBeInTheDocument();
		expect(screen.getByText('Reject')).toBeInTheDocument();
	});

	it('displays active matches', async () => {
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Active Matches (1)')).toBeInTheDocument();
		});

		// Verify active match details
		expect(
			screen.getByText('Matched with: partner@example.com')
		).toBeInTheDocument();
	});

	it('displays content matches', async () => {
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Content Matches (2)')).toBeInTheDocument();
		});

		// Verify content match details
		expect(screen.getByText('Test Movie')).toBeInTheDocument();
		expect(screen.getByText('Test TV Show')).toBeInTheDocument();

		// Check if match percentage is displayed - using getAllByText since there are multiple
		expect(screen.getAllByText(/90.*Match/)).toHaveLength(2);

		// Check if user statuses are displayed
		expect(screen.getByText('to watch together')).toBeInTheDocument();
		expect(screen.getAllByText('watching').length).toBe(2); // Two "watching" texts
	});

	it('allows accepting a match request', async () => {
		const user = userEvent.setup();
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Match Requests (1)')).toBeInTheDocument();
		});

		// Find the accept button that's a child of the card with sender info
		const pendingRequestContainer = screen
			.getByText('From: sender@example.com')
			.closest('div');
		const acceptButton = within(
			pendingRequestContainer as HTMLElement
		).getByText('Accept');

		// Click the accept button
		await user.click(acceptButton);

		// Verify API was called with correct parameters
		expect(matchesApi.updateStatus).toHaveBeenCalledWith('match-1', 'accepted');
	});

	it('allows rejecting a match request', async () => {
		const user = userEvent.setup();
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Match Requests (1)')).toBeInTheDocument();
		});

		// Find the reject button that's a child of the card with sender info
		const pendingRequestContainer = screen
			.getByText('From: sender@example.com')
			.closest('div');
		const rejectButton = within(
			pendingRequestContainer as HTMLElement
		).getByText('Reject');

		// Click the reject button
		await user.click(rejectButton);

		// Verify API was called with correct parameters
		expect(matchesApi.updateStatus).toHaveBeenCalledWith('match-1', 'rejected');
	});

	it('allows filtering content matches by media type', async () => {
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Content Matches (2)')).toBeInTheDocument();
		});

		// Find all dropdowns and select the first one (media type filter)
		const allSelects = screen.getAllByRole('combobox');
		const mediaTypeSelect = allSelects.find((select) => {
			return within(select).queryByText('All Types') !== null;
		});

		expect(mediaTypeSelect).toBeTruthy();

		if (mediaTypeSelect) {
			// Change to movie filter
			fireEvent.change(mediaTypeSelect, { target: { value: 'movie' } });

			// Should only see the movie, not the TV show
			expect(screen.getByText('Test Movie')).toBeInTheDocument();
			expect(screen.queryByText('Test TV Show')).not.toBeInTheDocument();
		}
	});

	it('allows sorting content matches', async () => {
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Content Matches (2)')).toBeInTheDocument();
		});

		// Find movie and TV show titles before sorting
		const movieTitle = screen.getByText('Test Movie');
		const tvShowTitle = screen.getByText('Test TV Show');

		// Find all dropdowns and select the third one (sort)
		const allSelects = screen.getAllByRole('combobox');
		const sortSelect = allSelects.find((select) => {
			return within(select).queryByText('Best Match') !== null;
		});

		expect(sortSelect).toBeTruthy();

		if (sortSelect) {
			// Change sort order to recent
			fireEvent.change(sortSelect, { target: { value: 'recent' } });

			// Movie and TV show should still be visible in the correct order
			expect(screen.getByText('Test Movie')).toBeInTheDocument();
			expect(screen.getByText('Test TV Show')).toBeInTheDocument();
		}
	});

	it('shows message when no match requests are available', async () => {
		// Mock empty match requests
		(matchesApi.getAll as jest.Mock).mockResolvedValue([
			{
				match_id: 'match-2',
				user1_id: 'user-1',
				user2_id: 'user-3',
				status: 'accepted',
				user1: { email: 'test@example.com' },
				user2: { email: 'partner@example.com' },
			},
		]);

		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Match Requests')).toBeInTheDocument();
		});

		// Should show the no pending matches message
		expect(screen.getByText('No pending match requests')).toBeInTheDocument();
	});

	it('shows message when no active matches are available', async () => {
		// Mock empty active matches
		(matchesApi.getAll as jest.Mock).mockResolvedValue([
			{
				match_id: 'match-1',
				user1_id: 'user-2',
				user2_id: 'user-1',
				status: 'pending',
				user1: { email: 'sender@example.com' },
				user2: { email: 'test@example.com' },
			},
		]);

		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Active Matches')).toBeInTheDocument();
		});

		// Should show the no active matches message
		expect(screen.getByText('No active matches yet')).toBeInTheDocument();
	});

	it('shows message when no content matches are found with filters', async () => {
		render(<MatchPage />);

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByText('Content Matches (2)')).toBeInTheDocument();
		});

		// Apply a filter that will result in no matches
		// Find status filter dropdown (second select)
		const allSelects = screen.getAllByRole('combobox');
		const statusSelect = allSelects.find((select) => {
			return within(select).queryByText('All Status') !== null;
		});

		expect(statusSelect).toBeTruthy();

		if (statusSelect) {
			// Filter to to_watch (which isn't in our mock data)
			fireEvent.change(statusSelect, { target: { value: 'to_watch' } });

			// Should show no matches message
			expect(
				screen.getByText('No content matches found with current filters')
			).toBeInTheDocument();
		}
	});
});
