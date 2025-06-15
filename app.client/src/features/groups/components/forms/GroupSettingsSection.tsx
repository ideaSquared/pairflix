import { Badge } from '@pairflix/components';
import {
  HiCheckCircle,
  HiEnvelope,
  HiGlobeAlt,
  HiLockClosed,
} from 'react-icons/hi2';
import styled from 'styled-components';

interface GroupSettingsSectionProps {
  settings: {
    isPublic: boolean;
    requireApproval: boolean;
    allowInvites: boolean;
  };
  onSettingChange: (setting: string, value: boolean) => void;
  disabled?: boolean;
}

// Styled components
const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.lg || '1024px'}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const SettingsLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
`;

const StyledCheckbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
`;

const CheckboxContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
`;

const CheckboxLabel = styled.label`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const CheckboxDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const PreviewPanel = styled.div`
  background-color: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f9fafb'};
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '12px'};
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  border: 1px solid ${({ theme }) => theme?.colors?.border?.light || '#e5e7eb'};
`;

const PreviewTitle = styled.h4`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.base || '1rem'};
  font-weight: ${({ theme }) =>
    theme?.typography?.fontWeight?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0 0 ${({ theme }) => theme?.spacing?.md || '1rem'} 0;
`;

const PreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
`;

const PreviewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
`;

const PreviewLabel = styled.span`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

export default function GroupSettingsSection({
  settings,
  onSettingChange,
  disabled = false,
}: GroupSettingsSectionProps) {
  return (
    <SettingsGrid>
      <SettingsLeft>
        <CheckboxGroup>
          <StyledCheckbox
            type="checkbox"
            id="isPublic"
            checked={settings.isPublic}
            onChange={e => onSettingChange('isPublic', e.target.checked)}
            disabled={disabled}
          />
          <CheckboxContent>
            <CheckboxLabel htmlFor="isPublic">
              <HiGlobeAlt style={{ marginRight: '0.5rem' }} />
              Make this group public
            </CheckboxLabel>
            <CheckboxDescription>
              Others can discover and request to join your group
            </CheckboxDescription>
          </CheckboxContent>
        </CheckboxGroup>

        <CheckboxGroup>
          <StyledCheckbox
            type="checkbox"
            id="requireApproval"
            checked={settings.requireApproval}
            onChange={e => onSettingChange('requireApproval', e.target.checked)}
            disabled={disabled}
          />
          <CheckboxContent>
            <CheckboxLabel htmlFor="requireApproval">
              <HiCheckCircle style={{ marginRight: '0.5rem' }} />
              Require approval for new members
            </CheckboxLabel>
            <CheckboxDescription>
              You'll need to approve new member requests
            </CheckboxDescription>
          </CheckboxContent>
        </CheckboxGroup>

        <CheckboxGroup>
          <StyledCheckbox
            type="checkbox"
            id="allowInvites"
            checked={settings.allowInvites}
            onChange={e => onSettingChange('allowInvites', e.target.checked)}
            disabled={disabled}
          />
          <CheckboxContent>
            <CheckboxLabel htmlFor="allowInvites">
              <HiEnvelope style={{ marginRight: '0.5rem' }} />
              Allow members to invite others
            </CheckboxLabel>
            <CheckboxDescription>
              Group members can send invitations to their friends
            </CheckboxDescription>
          </CheckboxContent>
        </CheckboxGroup>
      </SettingsLeft>

      <PreviewPanel>
        <PreviewTitle>Preview Settings</PreviewTitle>
        <PreviewContent>
          <PreviewRow>
            <PreviewLabel>Visibility:</PreviewLabel>
            <Badge
              variant={settings.isPublic ? 'info' : 'secondary'}
              size="small"
              pill
            >
              {settings.isPublic ? (
                <>
                  <HiGlobeAlt style={{ marginRight: '0.25rem' }} />
                  Public
                </>
              ) : (
                <>
                  <HiLockClosed style={{ marginRight: '0.25rem' }} />
                  Private
                </>
              )}
            </Badge>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>New members:</PreviewLabel>
            <Badge
              variant={settings.requireApproval ? 'warning' : 'success'}
              size="small"
              pill
            >
              {settings.requireApproval ? 'Need approval' : 'Auto-join'}
            </Badge>
          </PreviewRow>
          <PreviewRow>
            <PreviewLabel>Invitations:</PreviewLabel>
            <Badge
              variant={settings.allowInvites ? 'success' : 'secondary'}
              size="small"
              pill
            >
              {settings.allowInvites ? 'Enabled' : 'Disabled'}
            </Badge>
          </PreviewRow>
        </PreviewContent>
      </PreviewPanel>
    </SettingsGrid>
  );
}
