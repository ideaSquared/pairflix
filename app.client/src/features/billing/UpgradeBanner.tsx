import { Button, Typography } from '@pairflix/components';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { Entitlements } from '../../services/api';
import type { Theme } from '../../styles/theme';

const BannerContainer = styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm}
    ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface UpgradeBannerProps {
  entitlements: Entitlements;
}

const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ entitlements }) => {
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
    <BannerContainer role="status">
      <Typography variant="body2">{message}</Typography>
      <Button
        variant="primary"
        onClick={() => navigate('/billing/mock-checkout')}
      >
        Upgrade
      </Button>
    </BannerContainer>
  );
};

export default UpgradeBanner;
