import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from '../../services/api/utils';
import SessionExpiredHandler from './SessionExpiredHandler';

const locationProbe = { path: '' };
const LocationProbe = () => {
  locationProbe.path = useLocation().pathname;
  return null;
};
LocationProbe.displayName = 'LocationProbe';

const renderWithProviders = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/tonight'] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
        createElement(LocationProbe)
      )
    );
  return render(
    createElement(Wrapper, null, createElement(SessionExpiredHandler))
  );
};

describe('SessionExpiredHandler', () => {
  beforeEach(() => {
    locationProbe.path = '';
  });

  it('clears the cache and navigates to /login when the auth query has cached user data', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['auth'], { id: 'u1', username: 'test' });
    queryClient.setQueryData(['households'], [{ id: 'h1' }]);

    renderWithProviders(queryClient);

    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

    await waitFor(() => expect(locationProbe.path).toBe('/login'));
    expect(queryClient.getQueryData(['auth'])).toBeUndefined();
    expect(queryClient.getQueryData(['households'])).toBeUndefined();
  });

  it('ignores the event for an anonymous visitor with no cached auth data', async () => {
    const queryClient = new QueryClient();

    renderWithProviders(queryClient);

    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

    // Give any (incorrect) navigation a chance to happen before asserting it didn't.
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(locationProbe.path).toBe('/tonight');
  });
});
