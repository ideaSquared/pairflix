import {
  Alert,
  Badge,
  Button,
  Card,
  Input,
  Textarea,
} from '@pairflix/components';
import { useState } from 'react';
import {
  HiCheckCircle,
  HiEnvelope,
  HiExclamationTriangle,
  HiFilm,
  HiGlobeAlt,
  HiLockClosed,
  HiSparkles,
  HiUsers,
} from 'react-icons/hi2';
import styled, { useTheme } from 'styled-components';
import type { CreateGroupRequest, GroupType } from '../../../types/group';

interface CreateGroupFormProps {
  onSubmit: (data: CreateGroupRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  type: 'friends' | 'watch_party';
  max_members: string;
  isPublic: boolean;
  requireApproval: boolean;
  allowInvites: boolean;
}

interface FormErrors {
  name?: string;
  type?: string;
  max_members?: string;
}

// Styled components
const FormContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};
`;

const HeaderSection = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const HeaderIcon = styled.div`
  font-size: 3.75rem;
  line-height: 1;
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const HeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xl || '1.5rem'};
  font-size: 1.875rem;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

const HeaderDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  max-width: 512px;
  margin: 0 auto;
  line-height: 1.6;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const TypeOption = styled.div<{ $isSelected: boolean }>`
  position: relative;
  cursor: pointer;
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  border: 2px solid;
  border-color: ${({ $isSelected, theme }) =>
    $isSelected
      ? theme?.colors?.primary || '#3b82f6'
      : theme?.colors?.border?.default || '#d1d5db'};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected
      ? theme?.colors?.background?.highlight || '#eff6ff'
      : theme?.colors?.background?.primary || '#ffffff'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme?.colors?.border?.light || '#9ca3af'};
  }
`;

const TypeOptionContent = styled.div`
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const TypeOptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const TypeOptionIcon = styled.span`
  font-size: 1.5rem;
`;

const TypeOptionLabel = styled.span`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
`;

const TypeOptionDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const HiddenRadio = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const ErrorMessage = styled.p`
  margin-top: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.error || '#dc2626'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
  margin: 0;
`;

const BasicInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BasicInfoLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const InputLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#374151'};
`;

const HelpText = styled.p`
  margin-top: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xs || '0.75rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const CharacterCount = styled.p`
  margin-top: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xs || '0.75rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SettingsLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.xl || '2rem'};
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
`;

const StyledCheckbox = styled.input`
  margin-top: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
  border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
  border-color: ${({ theme }) => theme?.colors?.border?.default || '#d1d5db'};
  color: ${({ theme }) => theme?.colors?.primary || '#2563eb'};

  &:focus {
    ring: 2px;
    ring-color: ${({ theme }) => theme?.colors?.primary || '#3b82f6'};
  }
`;

const CheckboxContent = styled.div`
  flex: 1;
`;

const CheckboxLabel = styled.label`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  cursor: pointer;
`;

const CheckboxDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin-top: ${({ theme }) => theme?.spacing?.xs || '0.25rem'};
  margin: 0;
`;

const PreviewPanel = styled.div`
  background-color: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f9fafb'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const PreviewTitle = styled.h4`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0 0 ${({ theme }) => theme?.spacing?.md || '1rem'} 0;
`;

const PreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
`;

const PreviewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PreviewLabel = styled.span`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
  padding-top: ${({ theme }) => theme?.spacing?.xl || '2rem'};
  border-top: 1px solid
    ${({ theme }) => theme?.colors?.border?.default || '#e5e7eb'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.sm || '640px'}) {
    flex-direction: row;
    gap: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
  }
`;

const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
`;

const ErrorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default function CreateGroupForm({
  onSubmit,
  onCancel,
  loading = false,
}: CreateGroupFormProps) {
  const theme = useTheme();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'friends',
    max_members: '',
    isPublic: false,
    requireApproval: true,
    allowInvites: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const groupTypeOptions = [
    {
      value: 'friends' as GroupType,
      label: 'Friends Group',
      description: 'Watch movies and shows with your friends',
      icon: <HiUsers />,
      color: theme?.colors?.primary || '#2563eb',
    },
    {
      value: 'watch_party' as GroupType,
      label: 'Watch Party',
      description: 'Organize watch parties and events',
      icon: <HiFilm />,
      color: theme?.colors?.text?.warning || '#ea580c',
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Group name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Group name cannot exceed 50 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Group type is required';
    }

    if (formData.max_members && isNaN(Number(formData.max_members))) {
      newErrors.max_members = 'Max members must be a number';
    } else if (formData.max_members && Number(formData.max_members) < 2) {
      newErrors.max_members = 'Max members must be at least 2';
    } else if (formData.max_members && Number(formData.max_members) > 50) {
      newErrors.max_members = 'Max members cannot exceed 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitError(null);

      const submitData: CreateGroupRequest = {
        name: formData.name,
        ...(formData.description && { description: formData.description }),
        type: formData.type,
        ...(formData.max_members && {
          max_members: parseInt(formData.max_members),
        }),
        settings: {
          isPublic: formData.isPublic,
          requireApproval: formData.requireApproval,
          allowInvites: formData.allowInvites,
        },
      };

      await onSubmit(submitData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create group'
      );
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectedGroupType = groupTypeOptions.find(
    option => option.value === formData.type
  );

  return (
    <FormContainer>
      <StyledForm onSubmit={handleSubmit}>
        {/* Header Section */}
        <HeaderSection>
          <HeaderIcon>
            <HiSparkles />
          </HeaderIcon>
          <HeaderContent>
            <HeaderTitle>Create New Group</HeaderTitle>
            <HeaderDescription>
              Set up your group to start watching together
            </HeaderDescription>
          </HeaderContent>
        </HeaderSection>

        {submitError && (
          <Alert variant="error">
            <ErrorContent>
              <HiExclamationTriangle />
              <span>{submitError}</span>
            </ErrorContent>
          </Alert>
        )}

        {/* Group Type Selection */}
        <Card variant="outlined" elevation="low">
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>Choose Group Type</SectionTitle>
              <SectionDescription>
                Select the type that best describes your group
              </SectionDescription>
            </SectionHeader>

            <TypeGrid>
              {groupTypeOptions.map(option => (
                <TypeOption
                  key={option.value}
                  $isSelected={formData.type === option.value}
                  onClick={() => handleInputChange('type', option.value)}
                >
                  <TypeOptionContent>
                    <TypeOptionHeader>
                      <TypeOptionIcon>{option.icon}</TypeOptionIcon>
                      <TypeOptionLabel>{option.label}</TypeOptionLabel>
                      {formData.type === option.value && (
                        <Badge variant="primary" size="small" pill>
                          Selected
                        </Badge>
                      )}
                    </TypeOptionHeader>
                    <TypeOptionDescription>
                      {option.description}
                    </TypeOptionDescription>
                  </TypeOptionContent>
                  <HiddenRadio
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={formData.type === option.value}
                    onChange={() => handleInputChange('type', option.value)}
                  />
                </TypeOption>
              ))}
            </TypeGrid>

            {errors.type && (
              <ErrorMessage>
                <HiExclamationTriangle />
                <span>{errors.type}</span>
              </ErrorMessage>
            )}
          </SectionContainer>
        </Card>

        {/* Basic Information */}
        <Card variant="outlined" elevation="low">
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>Basic Information</SectionTitle>
              <SectionDescription>
                Give your group a name and description
              </SectionDescription>
            </SectionHeader>

            <BasicInfoGrid>
              <BasicInfoLeft>
                <InputGroup>
                  <InputLabel htmlFor="name">Group Name *</InputLabel>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder={`Enter your ${selectedGroupType?.label.toLowerCase()} group name`}
                    error={!!errors.name}
                    disabled={loading}
                    isFullWidth
                  />
                  {errors.name && (
                    <ErrorMessage>
                      <HiExclamationTriangle />
                      <span>{errors.name}</span>
                    </ErrorMessage>
                  )}
                </InputGroup>

                <InputGroup>
                  <InputLabel htmlFor="max_members">
                    Max Members (Optional)
                  </InputLabel>
                  <Input
                    id="max_members"
                    name="max_members"
                    type="number"
                    value={formData.max_members}
                    onChange={e =>
                      handleInputChange('max_members', e.target.value)
                    }
                    placeholder="Leave blank for unlimited"
                    min="2"
                    max="50"
                    error={!!errors.max_members}
                    disabled={loading}
                    isFullWidth
                  />
                  {errors.max_members && (
                    <ErrorMessage>
                      <HiExclamationTriangle />
                      <span>{errors.max_members}</span>
                    </ErrorMessage>
                  )}
                  <HelpText>
                    Recommended: 4-8 members for best experience
                  </HelpText>
                </InputGroup>
              </BasicInfoLeft>

              <InputGroup>
                <InputLabel htmlFor="description">
                  Description (Optional)
                </InputLabel>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder={`Tell others what your ${selectedGroupType?.label.toLowerCase()} group is about...`}
                  rows={6}
                  disabled={loading}
                  isFullWidth
                />
                <CharacterCount>
                  {formData.description.length}/300 characters
                </CharacterCount>
              </InputGroup>
            </BasicInfoGrid>
          </SectionContainer>
        </Card>

        {/* Group Settings */}
        <Card variant="outlined" elevation="low">
          <SectionContainer>
            <SectionHeader>
              <SectionTitle>Group Settings</SectionTitle>
              <SectionDescription>
                Configure how your group works
              </SectionDescription>
            </SectionHeader>

            <SettingsGrid>
              <SettingsLeft>
                <CheckboxGroup>
                  <StyledCheckbox
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={e =>
                      handleInputChange('isPublic', e.target.checked)
                    }
                    disabled={loading}
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
                    checked={formData.requireApproval}
                    onChange={e =>
                      handleInputChange('requireApproval', e.target.checked)
                    }
                    disabled={loading}
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
                    checked={formData.allowInvites}
                    onChange={e =>
                      handleInputChange('allowInvites', e.target.checked)
                    }
                    disabled={loading}
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
                      variant={formData.isPublic ? 'info' : 'secondary'}
                      size="small"
                      pill
                    >
                      {formData.isPublic ? (
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
                      variant={formData.requireApproval ? 'warning' : 'success'}
                      size="small"
                      pill
                    >
                      {formData.requireApproval ? 'Need approval' : 'Auto-join'}
                    </Badge>
                  </PreviewRow>
                  <PreviewRow>
                    <PreviewLabel>Invitations:</PreviewLabel>
                    <Badge
                      variant={formData.allowInvites ? 'success' : 'secondary'}
                      size="small"
                      pill
                    >
                      {formData.allowInvites ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </PreviewRow>
                </PreviewContent>
              </PreviewPanel>
            </SettingsGrid>
          </SectionContainer>
        </Card>

        {/* Action Buttons */}
        <ActionButtons>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} disabled={loading}>
            <ButtonContent>
              <HiSparkles style={{ marginRight: '0.5rem' }} />
              <span>{loading ? 'Creating...' : 'Create Group'}</span>
            </ButtonContent>
          </Button>
        </ActionButtons>
      </StyledForm>
    </FormContainer>
  );
}
