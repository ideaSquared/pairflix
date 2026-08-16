import { render } from '@testing-library/react';
import DocumentTitle from './DocumentTitle';

// Mock console.error to avoid warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('DocumentTitle', () => {
  beforeEach(() => {
    // Reset document title before each test
    document.title = 'Test';
  });

  it('renders without crashing', () => {
    render(<DocumentTitle />);
  });

  it('sets document title to default when no props provided', () => {
    render(<DocumentTitle />);
    expect(document.title).toBe('PairFlix');
  });

  it('uses custom default site name', () => {
    render(<DocumentTitle defaultSiteName="Custom App" />);
    expect(document.title).toBe('Custom App');
  });

  it('uses site name when provided', () => {
    render(<DocumentTitle siteName="My Site" />);
    expect(document.title).toBe('My Site');
  });

  it('prefers site name over default', () => {
    render(<DocumentTitle siteName="My Site" defaultSiteName="Default" />);
    expect(document.title).toBe('My Site');
  });

  it('formats title with site name', () => {
    render(<DocumentTitle title="Page Title" siteName="My Site" />);
    expect(document.title).toBe('Page Title | My Site');
  });

  it('formats title with default site name when no site name provided', () => {
    render(<DocumentTitle title="Page Title" />);
    expect(document.title).toBe('Page Title | PairFlix');
  });

  it('updates title when props change', () => {
    const { rerender } = render(<DocumentTitle title="First Title" />);
    expect(document.title).toBe('First Title | PairFlix');

    rerender(<DocumentTitle title="Second Title" />);
    expect(document.title).toBe('Second Title | PairFlix');
  });

  it('restores default title on unmount', () => {
    const { unmount } = render(
      <DocumentTitle title="Test Title" defaultSiteName="Custom App" />
    );
    expect(document.title).toBe('Test Title | Custom App');

    unmount();
    expect(document.title).toBe('Custom App');
  });

  it('handles empty title correctly', () => {
    render(<DocumentTitle title="" siteName="My Site" />);
    expect(document.title).toBe('My Site');
  });
});
