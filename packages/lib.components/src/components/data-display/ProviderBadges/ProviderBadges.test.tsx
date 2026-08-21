import { render, screen } from '@testing-library/react';
import { lightThemeClass, themeRoot } from '../../../styles/theme.css';
import { ProviderBadges, type ProviderSummary } from './ProviderBadges';

const netflix: ProviderSummary = {
  provider_id: 8,
  provider_name: 'Netflix',
  logo_path: '/netflix.jpg',
};

const prime: ProviderSummary = {
  provider_id: 9,
  provider_name: 'Prime Video',
  logo_path: '/prime.jpg',
};

const renderWithTheme = (ui: React.ReactElement) =>
  render(<div className={`${lightThemeClass} ${themeRoot}`}>{ui}</div>);

describe('ProviderBadges', () => {
  it('renders nothing when no provider has a logo_path', () => {
    renderWithTheme(
      <ProviderBadges
        providers={[
          { provider_id: 1, provider_name: 'Foo', logo_path: null },
          { provider_id: 2, provider_name: 'Bar', logo_path: null },
        ]}
      />
    );

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders nothing when the providers list is empty', () => {
    renderWithTheme(<ProviderBadges providers={[]} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('filters out providers without a logo_path', () => {
    renderWithTheme(
      <ProviderBadges
        providers={[
          netflix,
          { provider_id: 3, provider_name: 'NoLogo', logo_path: null },
        ]}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByAltText('Netflix')).toBeInTheDocument();
    expect(screen.queryByAltText('NoLogo')).not.toBeInTheDocument();
  });

  it('renders anchor links with target and rel when a deepLink is set', () => {
    renderWithTheme(
      <ProviderBadges
        providers={[netflix]}
        deepLink="https://justwatch.com/title"
      />
    );

    const list = screen.getByRole('list', { name: 'Watch providers' });
    expect(list).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Watch on Netflix' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://justwatch.com/title');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    expect(screen.getByAltText('Netflix')).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/original/netflix.jpg'
    );
  });

  it('appends the affiliate suffix keyed by provider_name to the deepLink', () => {
    renderWithTheme(
      <ProviderBadges
        providers={[netflix, prime]}
        deepLink="https://justwatch.com/title"
        affiliateParams={{ Netflix: '?ref=pairflix' }}
      />
    );

    expect(
      screen.getByRole('link', { name: 'Watch on Netflix' })
    ).toHaveAttribute('href', 'https://justwatch.com/title?ref=pairflix');

    expect(
      screen.getByRole('link', { name: 'Watch on Prime Video' })
    ).toHaveAttribute('href', 'https://justwatch.com/title');
  });

  it('renders static span chips (no links) when no deepLink is set', () => {
    renderWithTheme(<ProviderBadges providers={[netflix]} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    const chip = screen.getByTitle('Netflix');
    expect(chip.tagName).toBe('SPAN');
    expect(screen.getByAltText('Netflix')).toBeInTheDocument();
  });

  it('applies the size prop as width and height, defaulting to 32', () => {
    const { rerender } = renderWithTheme(
      <ProviderBadges providers={[netflix]} size={48} />
    );
    expect(screen.getByTitle('Netflix')).toHaveStyle({
      width: '48px',
      height: '48px',
    });

    rerender(
      <div className={`${lightThemeClass} ${themeRoot}`}>
        <ProviderBadges providers={[netflix]} />
      </div>
    );
    expect(screen.getByTitle('Netflix')).toHaveStyle({
      width: '32px',
      height: '32px',
    });
  });
});
