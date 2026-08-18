import type { Entitlements } from '../../../services/api';
import { render, screen } from '../../../tests/setup';
import UpgradeBanner from '../UpgradeBanner';

const freeExhausted: Entitlements = {
  tier: 'free',
  dailyPickLimit: 1,
  picksUsedToday: 1,
  picksRemaining: 0,
  canUseLlmRerank: false,
  canUseMultiRegion: false,
  regionLock: null,
};

describe('UpgradeBanner', () => {
  it('shows the upgrade prompt when the free tier has exhausted its daily quota', () => {
    render(
      <UpgradeBanner entitlements={freeExhausted} householdId="household-1" />
    );

    expect(
      screen.getByText('No picks left today — upgrade for unlimited.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument();
  });

  it('shows the upgrade prompt when the free tier is close to exhausting its quota', () => {
    render(
      <UpgradeBanner
        entitlements={{
          ...freeExhausted,
          picksUsedToday: 0,
          picksRemaining: 1,
        }}
        householdId="household-1"
      />
    );

    expect(
      screen.getByText('1 pick left today — upgrade for unlimited.')
    ).toBeInTheDocument();
  });

  it('does not show for premium households', () => {
    render(
      <UpgradeBanner
        entitlements={{ ...freeExhausted, tier: 'premium' }}
        householdId="household-1"
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Upgrade' })
    ).not.toBeInTheDocument();
  });

  it('does not show for free households that still have picks remaining', () => {
    render(
      <UpgradeBanner
        entitlements={{
          ...freeExhausted,
          picksUsedToday: 0,
          picksRemaining: 5,
        }}
        householdId="household-1"
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Upgrade' })
    ).not.toBeInTheDocument();
  });
});
