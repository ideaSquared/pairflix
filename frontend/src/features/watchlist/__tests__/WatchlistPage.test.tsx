import userEvent from '@testing-library/user-event';
import { user as userApi, watchlist } from '../../../services/api';
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '../../../tests/setup';
import WatchlistPage from '../WatchlistPage';

// Mock the API module
jest.mock('../../../services/api', () => {
	const originalModule = jest.requireActual('../../../services/api');
	return {
		...originalModule,
		watchlist: {
			...originalModule.watchlist,
			getAll: jest.fn(),
			update: jest.fn(),
		},
		user: {
			...originalModule.user,
			updatePreferences: jest.fn(),
		},
	};
});

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
	useAuth: jest.fn().mockReturnValue({
		user: { id: '1', preferences: { viewStyle: 'grid' } },
		isAuthenticated: true,
	}),
}));

describe('WatchlistPage', () => {
	const mockEntries = [
		{
			entry_id: '1',
			user_id: '1',
			tmdb_id: 123,
			media_type: 'movie',
			title: 'Test Movie',
			status: 'to_watch',
		},
		{
			entry_id: '2',
			user_id: '1',
			tmdb_id: 456,
			media_type: 'tv',
			title: 'Test TV Show',
			status: 'watching',
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock successful watchlist data
		(watchlist.getAll as jest.Mock).mockResolvedValue(mockEntries);
		(watchlist.update as jest.Mock).mockImplementation((id, updates) => {
			return Promise.resolve({
				...mockEntries.find((entry) => entry.entry_id === id),
				...updates,
			});
		});
		(userApi.updatePreferences as jest.Mock).mockResolvedValue({
			message: 'Preferences updated',
		});
	});

	it('renders the watchlist page with entries', async () => {
		render(<WatchlistPage />);

		// Initially shows loading
		expect(screen.getByText('Loading your watchlist...')).toBeInTheDocument();

		// Wait for the data to load
		await waitFor(() => {
			expect(screen.getByText('My Watchlist')).toBeInTheDocument();
		});

		// Check if watchlist entries are displayed
		expect(screen.getByText('Test Movie')).toBeInTheDocument();
		expect(screen.getByText('Test TV Show')).toBeInTheDocument();

		// Verify media type badges are displayed
		expect(screen.getByText('Movie')).toBeInTheDocument();
		expect(screen.getByText('TV Series')).toBeInTheDocument();
	});

	it('allows searching for entries', async () => {
		render(<WatchlistPage />);

		// Wait for entries to load
		await waitFor(() => {
			expect(screen.getByText('My Watchlist')).toBeInTheDocument();
		});

		// Find the search input and type
		const searchInput = screen.getByPlaceholderText('Search your watchlist...');
		fireEvent.change(searchInput, { target: { value: 'Movie' } });

		// Verify only matching entries are displayed
		expect(screen.getByText('Test Movie')).toBeInTheDocument();
		expect(screen.queryByText('Test TV Show')).not.toBeInTheDocument();

		// Clear search to show all entries again
		fireEvent.change(searchInput, { target: { value: '' } });
		expect(screen.getByText('Test Movie')).toBeInTheDocument();
		expect(screen.getByText('Test TV Show')).toBeInTheDocument();
	});

	it('allows changing view style between grid and list', async () => {
		const testUser = userEvent.setup();
		render(<WatchlistPage />);

		// Wait for entries to load
		await waitFor(() => {
			expect(screen.getByText('My Watchlist')).toBeInTheDocument();
		});

		// Find the view style dropdown using a more specific selector
		const viewStyleSelects = screen.getAllByRole('combobox');
		// Get the one that has Grid View as an option
		const viewStyleSelect = viewStyleSelects.find((select) =>
			select.innerHTML.includes('Grid View')
		);

		// Make sure we found it
		expect(viewStyleSelect).toBeTruthy();

		if (viewStyleSelect) {
			// Use direct DOM manipulation since the select might be tricky
			await testUser.selectOptions(viewStyleSelect, 'list');

			// Wait for the API call
			await waitFor(() => {
				expect(userApi.updatePreferences).toHaveBeenCalled();
			});
		}
	});

	it('allows changing entry status', async () => {
		render(<WatchlistPage />);

		// Wait for entries to load
		await waitFor(() => {
			expect(screen.getByText('My Watchlist')).toBeInTheDocument();
		});

		// Find the container that has the movie title
		const movieTitle = screen.getByText('Test Movie');
		// Get the parent container that should contain both the title and the select
		const movieContainer = movieTitle.closest('div');

		if (movieContainer) {
			// Find the select within this container
			const selects = within(
				movieContainer.parentElement as HTMLElement
			).getAllByRole('combobox');
			const select = selects[0]; // Get the first select

			// Change the status
			fireEvent.change(select, { target: { value: 'finished' } });

			// Wait for the update to be called
			await waitFor(() => {
				expect(watchlist.update).toHaveBeenCalledWith('1', {
					status: 'finished',
				});
			});
		}
	});

	it('switches between list and search tabs', async () => {
		render(<WatchlistPage />);

		// Wait for entries to load
		await waitFor(() => {
			expect(screen.getByText('My Watchlist')).toBeInTheDocument();
		});

		// Check if we're on the list tab initially
		expect(
			screen.getByPlaceholderText('Search your watchlist...')
		).toBeInTheDocument();

		// Find and click the Add New button
		const addNewButton = screen.getByRole('button', { name: /Add New/i });
		fireEvent.click(addNewButton);

		// Verify we're now on the search tab - search media component should be visible
		// and list search box should not be visible
		expect(
			screen.queryByPlaceholderText('Search your watchlist...')
		).not.toBeInTheDocument();

		// Go back to list tab
		const myListButton = screen.getByRole('button', { name: /My List/i });
		fireEvent.click(myListButton);

		// Verify we're back on the list tab
		expect(
			screen.getByPlaceholderText('Search your watchlist...')
		).toBeInTheDocument();
	});
});
