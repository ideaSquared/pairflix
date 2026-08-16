import { Button, Typography } from '@pairflix/components';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Entitlements } from '../../services/api';
import * as styles from './UpgradeBanner.css';

interface UpgradeBannerProps {
  entitlements: Entitlements;
  householdId: string;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  entitlements,
  householdId,
}) => {
  const navigate = useNavigate();

  if (entitlements.tier === 'premium') {
    return null;
  }
  if (entitlements.picks_remaining > 1) {
    return null;
  }

  const message =
    entitlements.picks_remaining === 0
      ? 'No picks left today — upgrade for unlimited.'
      : `${entitlements.picks_remaining} pick left today — upgrade for unlimited.`;

  return (
    <div className={styles.bannerContainer} role="status">
      <Typography variant="body2">{message}</Typography>
      <Button
        variant="primary"
        onClick={() =>
          navigate(`/billing/mock-checkout?household=${householdId}`)
        }
      >
        Upgrade
      </Button>
    </div>
  );
};

export default UpgradeBanner;
