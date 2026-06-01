import React, { forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';

export interface ProviderSummary {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface ProviderBadgesProps extends BaseComponentProps {
  /**
   * Watch providers (e.g. flatrate list from TMDb).
   */
  providers: ProviderSummary[];

  /**
   * Deep link to the JustWatch (or provider) page for this title.
   * When set, each chip becomes a link to this URL.
   */
  deepLink?: string;

  /**
   * Affiliate parameter map keyed by provider name. The matching value is
   * appended to the deep link as a suffix (e.g. `?ref=pairflix`).
   * Defaults to an empty object so links pass through unmodified.
   */
  affiliateParams?: Record<string, string>;

  /**
   * Size of each provider chip in pixels.
   * @default 32
   */
  size?: number;
}

const Row = styled.ul<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.xs || '4px'};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li`
  display: inline-flex;
`;

const Chip = styled.a<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '6px'};
  overflow: hidden;
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f5f5f5'};
  border: 1px solid
    ${({ theme }) => theme?.colors?.border?.default || '#e0e0e0'};
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme?.colors?.primary || '#0077cc'};
    outline-offset: 2px;
  }
`;

const ChipStatic = styled.span<{ $size: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '6px'};
  overflow: hidden;
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f5f5f5'};
  border: 1px solid
    ${({ theme }) => theme?.colors?.border?.default || '#e0e0e0'};
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/original';

const buildAffiliateLink = (
  deepLink: string,
  providerName: string,
  affiliateParams: Record<string, string>
): string => {
  const suffix = affiliateParams[providerName];
  if (!suffix) {
    return deepLink;
  }
  return `${deepLink}${suffix}`;
};

/**
 * Horizontally-stacked TMDb watch provider logos. When `deepLink` is set,
 * each chip becomes an external link (optionally with an affiliate suffix
 * appended).
 */
export const ProviderBadges = forwardRef<HTMLUListElement, ProviderBadgesProps>(
  (
    {
      providers,
      deepLink,
      affiliateParams,
      size = 32,
      className,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const params = useMemo(() => affiliateParams ?? {}, [affiliateParams]);

    const withLogo = providers?.filter(p => p.logo_path) ?? [];
    if (withLogo.length === 0) {
      return null;
    }

    return (
      <Row
        ref={ref}
        className={className}
        $size={size}
        data-testid={dataTestId}
        aria-label={ariaLabel ?? 'Watch providers'}
      >
        {withLogo.map(provider => {
          const logoUrl = `${TMDB_LOGO_BASE}${provider.logo_path}`;
          const altText = provider.provider_name;

          if (deepLink) {
            const href = buildAffiliateLink(
              deepLink,
              provider.provider_name,
              params
            );
            return (
              <Item key={provider.provider_id}>
                <Chip
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  $size={size}
                  aria-label={`Watch on ${altText}`}
                  title={altText}
                >
                  <Logo src={logoUrl} alt={altText} loading="lazy" />
                </Chip>
              </Item>
            );
          }

          return (
            <Item key={provider.provider_id}>
              <ChipStatic $size={size} title={altText}>
                <Logo src={logoUrl} alt={altText} loading="lazy" />
              </ChipStatic>
            </Item>
          );
        })}
      </Row>
    );
  }
);

ProviderBadges.displayName = 'ProviderBadges';

export default ProviderBadges;
