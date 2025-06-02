import { search, watchlist } from '../../../services/api';
import { fireEvent, render, screen, waitFor } from '../../../tests/setup';
import SearchMedia from '../SearchMedia';

// Mock the API module
jest.mock('../../../services/api', () => {
	const originalModule = jest.requireActual('../../../services/api');
	return {
		...originalModule,
		search: {
			...originalModule.search,
			media: jest.fn(),
		},
		watchlist: {
			...originalModule.watchlist,
			add: jest.fn(),
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

describe('SearchMedia', () => {
	const mockSearchResults = [
		{
			id: 123,
			title: 'Test Movie',
			media_type: 'movie',
			poster_path: '/test-movie-path.jpg',
			overview: 'This is a test movie overview',
		},
		{
			id: 456,
			name: 'Test TV Show',
			media_type: 'tv',
			poster_path: '/test-tv-path.jpg',
			overview: 'This is a test TV show overview',
		},
	];

	beforeEach(() => {
		jest.clearAllMocks();
		(search.media as jest.Mock).mockResolvedValue(mockSearchResults);
		(watchlist.add as jest.Mock).mockResolvedValue({ entry_id: 'new-entry-1' });
	});

	it('renders the search input', () => {
		render(<SearchMedia />);
		expect(
			screen.getByPlaceholderText('Search for movies or TV shows...')
		).toBeInTheDocument();
	});

	it('displays search results when query is entered', async () => {
		render(<SearchMedia />);

		// Type in search box
		const searchInput = screen.getByPlaceholderText(
			'Search for movies or TV shows...'
		);
		fireEvent.change(searchInput, { target: { value: 'test' } });

		// Check if API was called
		await waitFor(() => {
			expect(search.media).toHaveBeenCalledWith('test');
		});

		// Check if results are displayed
		await waitFor(() => {
			expect(screen.getByText('Test Movie')).toBeInTheDocument();
			expect(screen.getByText('Test TV Show')).toBeInTheDocument();
		});

		// Check media type badges
		expect(screen.getByText('Movie')).toBeInTheDocument();
		expect(screen.getByText('TV Series')).toBeInTheDocument();
	});

	it('adds an item to watchlist when "Add to Watchlist" button is clicked', async () => {
		render(<SearchMedia />);

		// Type in search box to get results
		const searchInput = screen.getByPlaceholderText(
			'Search for movies or TV shows...'
		);
		fireEvent.change(searchInput, { target: { value: 'test' } });

		// Wait for results to appear
		await waitFor(() => {
			expect(screen.getByText('Test Movie')).toBeInTheDocument();
		});

		// Find and click the Add to Watchlist button for the movie using a more reliable query
		const addButtons = await screen.findAllByRole('button', {
			name: /add to watchlist/i,
		});
		if (addButtons[0]) {
			fireEvent.click(addButtons[0]);
		} else {
			throw new Error('Add to Watchlist button not found');
		}

		// Verify API call to add to watchlist
		await waitFor(() => {
			expect(watchlist.add).toHaveBeenCalledWith({
				tmdb_id: 123,
				media_type: 'movie',
				status: 'to_watch',
			});
		});
	});

	it('shows loading state while searching', async () => {
		// Delay the API response to show loading state
		(search.media as jest.Mock).mockImplementation(() => {
			return new Promise((resolve) => {
				setTimeout(() => resolve(mockSearchResults), 100);
			});
		});

		render(<SearchMedia />);

		// Type in search box
		const searchInput = screen.getByPlaceholderText(
			'Search for movies or TV shows...'
		);
		fireEvent.change(searchInput, { target: { value: 'test query' } });

		// Check for loading state using waitFor to ensure element exists
		await waitFor(() => {
			expect(screen.getByText('Loading...')).toBeInTheDocument();
		});

		// Eventually, results should be displayed
		await waitFor(() => {
			expect(screen.getByText('Test Movie')).toBeInTheDocument();
		});
	});

	it('handles empty search results', async () => {
		// Mock empty results
		(search.media as jest.Mock).mockResolvedValue([]);

		render(<SearchMedia />);

		// Type in search box
		const searchInput = screen.getByPlaceholderText(
			'Search for movies or TV shows...'
		);
		fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

		// Check for no results message
		await waitFor(() => {
			expect(screen.getByText('No results found')).toBeInTheDocument();
		});
	});

	it('handles API errors gracefully', async () => {
		// Mock API error
		const errorMessage = 'API connection failed';
		(search.media as jest.Mock).mockRejectedValue(new Error(errorMessage));

		render(<SearchMedia />);

		// Type in search box
		const searchInput = screen.getByPlaceholderText(
			'Search for movies or TV shows...'
		);
		fireEvent.change(searchInput, { target: { value: 'test' } });

		// Check for error message
		await waitFor(() => {
			expect(screen.getByText(errorMessage)).toBeInTheDocument();
		});
	});
});
