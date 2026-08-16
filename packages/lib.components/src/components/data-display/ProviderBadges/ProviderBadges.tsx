import clsx from 'clsx';
import React, { forwardRef, useMemo } from 'react';
import type { BaseComponentProps } from '../../../types';
import { chip, chipStatic, item, logo, row } from './ProviderBadges.css';

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
      <ul
        ref={ref}
        className={clsx(row, className)}
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
              <li key={provider.provider_id} className={item}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={chip}
                  style={{ width: size, height: size }}
                  aria-label={`Watch on ${altText}`}
                  title={altText}
                >
                  <img
                    className={logo}
                    src={logoUrl}
                    alt={altText}
                    loading="lazy"
                  />
                </a>
              </li>
            );
          }

          return (
            <li key={provider.provider_id} className={item}>
              <span
                className={chipStatic}
                style={{ width: size, height: size }}
                title={altText}
              >
                <img
                  className={logo}
                  src={logoUrl}
                  alt={altText}
                  loading="lazy"
                />
              </span>
            </li>
          );
        })}
      </ul>
    );
  }
);

ProviderBadges.displayName = 'ProviderBadges';

export default ProviderBadges;
