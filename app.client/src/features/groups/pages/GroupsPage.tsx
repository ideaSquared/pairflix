import { Alert, Button, Card, Modal } from '@pairflix/components';
import { useState } from 'react';
import {
  HiChartBar,
  HiCheckCircle,
  HiExclamationTriangle,
  HiFilm,
  HiHeart,
  HiSparkles,
  HiUsers,
} from 'react-icons/hi2';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes, useTheme } from 'styled-components';
import type { Theme } from '../../../styles/theme';
import type {
  CreateGroupRequest,
  CreateRelationshipRequest,
  Group,
} from '../../../types/group';
import CreateGroupForm from '../components/CreateGroupForm';
import CreateRelationshipForm from '../components/CreateRelationshipForm';
import GroupCard from '../components/GroupCard';
import GroupDetailPage from '../components/GroupDetailPage';
import { GroupsGrid } from '../components/layout';
import { useGroups } from '../hooks';

// Styled components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme?.colors?.background?.highlight || '#eff6ff'} 0%,
    ${({ theme }) => theme?.colors?.background?.primary || '#ffffff'} 50%,
    ${({ theme }) => theme?.colors?.background?.secondary || '#faf5ff'} 100%
  );
  padding: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    padding: 2rem;
  }
`;

const MainContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const CreateFormContainer = styled(ContentContainer)`
  padding: 3rem 1rem;
`;

// Loading Components
const LoadingContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SpinnerContainer = styled.div`
  position: relative;
  margin: 0 auto;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerOuter = styled.div`
  animation: ${spin} 1s linear infinite;
  border-radius: 50%;
  height: 5rem;
  width: 5rem;
  border: 4px solid ${({ theme }) => theme?.colors?.border?.light || '#bfdbfe'};
  margin: 0 auto;
`;

const SpinnerInner = styled.div`
  animation: ${spin} 1s linear infinite;
  border-radius: 50%;
  height: 5rem;
  width: 5rem;
  border-top: 4px solid ${({ theme }) => theme?.colors?.primary || '#2563eb'};
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
`;

const LoadingTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const LoadingTitle = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xl || '1.5rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

const LoadingDescription = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

// Hero Section Components
const HeroSection = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeroIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme?.colors?.primary || '#2563eb'} 0%,
    ${({ theme }) => theme?.colors?.status?.watchTogetherFocused || '#7c3aed'}
      100%
  );
  border-radius: 1.5rem;
  box-shadow: ${({ theme }) =>
    theme?.shadows?.lg || '0 10px 20px rgba(0, 0, 0, 0.15)'};
  margin: 0 auto;

  span {
    font-size: 2.5rem;
  }
`;

const HeroTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme?.colors?.text?.primary || '#111827'} 0%,
    ${({ theme }) => theme?.colors?.secondary || '#6b7280'} 100%
  );
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  margin: 0;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    font-size: 3.5rem;
  }
`;

const HeroDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xl || '1.5rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  max-width: 512px;
  margin: 0 auto;
  line-height: 1.6;
`;

// Stats Section
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 768px;
  margin: 0 auto;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StatsCard = styled(Card)`
  background: ${({ theme }) =>
    theme?.colors?.background?.card
      ? `${theme.colors.background.card}B3` // 70% opacity
      : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(8px);
  border: 1px solid
    ${({ theme }) =>
      theme?.colors?.border?.light
        ? `${theme.colors.border.light}33` // 20% opacity
        : 'rgba(255, 255, 255, 0.2)'};
`;

const StatsIconContainer = styled.div<{ $bgColor?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background-color: ${({ $bgColor }) => $bgColor};
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;

  span {
    font-size: 1.5rem;
  }
`;

const StatsValue = styled.div<{ $color?: string }>`
  font-size: 1.875rem;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ $color }) => $color};
  margin-bottom: 0.25rem;
`;

const StatsLabel = styled.div`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

// Action Buttons
const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.sm || '640px'}) {
    flex-direction: row;
  }
`;

const RelationshipButton = styled(Button)`
  padding: 0.75rem 2rem;
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  background: ${({ theme }) =>
    theme?.colors?.background?.card
      ? `${theme.colors.background.card}CC` // 80% opacity
      : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(8px);
  border: 2px solid
    ${({ theme }) =>
      theme?.colors?.status?.watchTogetherBackground
        ? `${theme.colors.status.watchTogetherBackground}66` // 40% opacity
        : '#fbcfe8'};
  color: ${({ theme }) =>
    theme?.colors?.status?.watchTogetherBackground || '#be185d'};
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) =>
    theme?.shadows?.lg || '0 10px 20px rgba(0, 0, 0, 0.15)'};

  &:hover {
    background: ${({ theme }) =>
      theme?.colors?.status?.watchTogetherBackground
        ? `${theme.colors.status.watchTogetherBackground}1A` // 10% opacity
        : '#fdf2f8'};
    border-color: ${({ theme }) =>
      theme?.colors?.status?.watchTogetherBackground
        ? `${theme.colors.status.watchTogetherBackground}99` // 60% opacity
        : '#f9a8d4'};
  }
`;

const CreateGroupButton = styled(Button)`
  padding: 0.75rem 2rem;
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme?.colors?.primary || '#2563eb'} 0%,
    ${({ theme }) => theme?.colors?.status?.watchTogetherFocused || '#7c3aed'}
      100%
  );
  color: ${({ theme }) => theme?.colors?.text?.primary || 'white'};
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) =>
    theme?.shadows?.lg || '0 10px 20px rgba(0, 0, 0, 0.15)'};

  &:hover {
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme?.colors?.primaryHover || '#1d4ed8'} 0%,
      ${({ theme }) => theme?.colors?.status?.watchTogetherFocused || '#6d28d9'}
        100%
    );
    box-shadow: ${({ theme }) =>
      theme?.shadows?.xl || '0 14px 28px rgba(0, 0, 0, 0.25)'};
    transform: translateY(-2px);
  }
`;

const ButtonIcon = styled.span`
  margin-right: 0.5rem;
  font-size: 1.25rem;
`;

// Error Section
const ErrorContainer = styled.div`
  max-width: 512px;
  margin: 0 auto;
`;

const ErrorAlert = styled(Alert)`
  background: ${({ theme }) =>
    theme?.colors?.text?.error ? `${theme.colors.text.error}10` : '#fef2f2'};
  border-color: ${({ theme }) =>
    theme?.colors?.text?.error ? `${theme.colors.text.error}40` : '#fecaca'};
`;

const ErrorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span:first-child {
    font-size: 1.5rem;
  }

  span:last-child {
    font-weight: ${({ theme }) =>
      theme?.typography?.fontWeight?.medium || '500'};
  }
`;

// Empty State
const EmptyStateContainer = styled.div`
  max-width: 512px;
  margin: 0 auto;
`;

const EmptyStateCard = styled(Card)`
  background: ${({ theme }) =>
    theme?.colors?.background?.card
      ? `${theme.colors.background.card}CC` // 80% opacity
      : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(8px);
`;

const EmptyStateContent = styled.div`
  text-align: center;
  padding: 4rem 0;
`;

const EmptyStateIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 5rem;
  height: 5rem;
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f3f4f6'};
  border-radius: 1.5rem;
  margin-bottom: 1.5rem;

  span {
    font-size: 2.5rem;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0 0 0.75rem 0;
`;

const EmptyStateDescription = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0 0 2rem 0;
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
`;

const EmptyStateButton = styled(Button)`
  padding: 0.5rem 1.5rem;
`;

export default function GroupsPage() {
  const theme = useTheme() as Theme;
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const {
    groups,
    primaryRelationship,
    loading,
    error,
    createRelationship,
    createGroup,
    refresh,
  } = useGroups();

  const [showCreateRelationshipModal, setShowCreateRelationshipModal] =
    useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Determine which view to show based on route
  const isCreateRoute = location.pathname === '/groups/create';
  const isGroupDetailRoute =
    groupId && location.pathname.includes(`/groups/${groupId}`);

  // Show group detail page
  if (isGroupDetailRoute) {
    return <GroupDetailPage />;
  }

  // Show create group form as full page
  if (isCreateRoute) {
    const handleCreateGroup = async (data: CreateGroupRequest) => {
      try {
        await createGroup(data);
        navigate('/groups');
      } catch {
        // Error handling is done in the hook
      }
    };

    const handleCancelCreate = () => {
      navigate('/groups');
    };

    return (
      <Container>
        <CreateFormContainer>
          <CreateGroupForm
            onSubmit={handleCreateGroup}
            onCancel={handleCancelCreate}
            loading={loading}
          />
        </CreateFormContainer>
      </Container>
    );
  }

  const handleCreateGroupNavigation = () => {
    navigate('/groups/create');
  };

  const handleCreateGroupModal = async (data: CreateGroupRequest) => {
    try {
      await createGroup(data);
      setShowCreateGroupModal(false);
      refresh();
    } catch {
      // Error handling is done in the hook
    }
  };

  const handleCreateRelationship = async (data: CreateRelationshipRequest) => {
    try {
      await createRelationship(data);
      setShowCreateRelationshipModal(false);
      refresh();
    } catch {
      // Error handling is done in the hook
    }
  };

  if (loading && !groups.length) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <SpinnerContainer>
            <SpinnerOuter />
            <SpinnerInner />
          </SpinnerContainer>
          <LoadingTextContainer>
            <LoadingTitle>Loading your groups</LoadingTitle>
            <LoadingDescription>
              Getting everything ready for you...
            </LoadingDescription>
          </LoadingTextContainer>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  const totalGroups = groups.length + (primaryRelationship ? 1 : 0);
  const activeGroups =
    groups.filter(g => g.status === 'active').length +
    (primaryRelationship?.status === 'active' ? 1 : 0);

  return (
    <Container>
      <ContentContainer>
        <MainContent>
          {/* Hero Header */}
          <HeroSection>
            <HeroContent>
              <HeroIcon>
                <HiUsers />
              </HeroIcon>
              <HeroTextContainer>
                <HeroTitle>My Groups</HeroTitle>
                <HeroDescription>
                  Connect with friends and discover amazing content together
                </HeroDescription>
              </HeroTextContainer>
            </HeroContent>

            {/* Stats Cards */}
            <StatsGrid>
              <StatsCard>
                <StatsIconContainer
                  $bgColor={theme?.colors?.background?.highlight || '#dbeafe'}
                >
                  <HiChartBar />
                </StatsIconContainer>
                <StatsValue $color={theme?.colors?.primary || '#2563eb'}>
                  {totalGroups}
                </StatsValue>
                <StatsLabel>Total Groups</StatsLabel>
              </StatsCard>

              <StatsCard>
                <StatsIconContainer
                  $bgColor={
                    theme?.colors?.status?.finished
                      ? `${theme.colors.status.finished}33` // 20% opacity
                      : '#dcfce7'
                  }
                >
                  <HiCheckCircle />
                </StatsIconContainer>
                <StatsValue
                  $color={theme?.colors?.status?.finished || '#16a34a'}
                >
                  {activeGroups}
                </StatsValue>
                <StatsLabel>Active Groups</StatsLabel>
              </StatsCard>

              <StatsCard>
                <StatsIconContainer
                  $bgColor={
                    theme?.colors?.status?.watchTogetherFocused || '#e9d5ff'
                  }
                >
                  <HiExclamationTriangle />
                </StatsIconContainer>
                <StatsValue
                  $color={
                    theme?.colors?.status?.watchTogetherFocused || '#9333ea'
                  }
                >
                  0
                </StatsValue>
                <StatsLabel>Invitations</StatsLabel>
              </StatsCard>
            </StatsGrid>

            {/* Action Buttons */}
            <ActionButtonsContainer>
              {!primaryRelationship && (
                <RelationshipButton
                  onClick={() => setShowCreateRelationshipModal(true)}
                  variant="outline"
                >
                  <ButtonIcon>
                    <HiHeart />
                  </ButtonIcon>
                  Create Relationship
                </RelationshipButton>
              )}
              <CreateGroupButton onClick={handleCreateGroupNavigation}>
                <ButtonIcon>
                  <HiSparkles />
                </ButtonIcon>
                Create Group
              </CreateGroupButton>
            </ActionButtonsContainer>
          </HeroSection>

          {/* Error Display */}
          {error && (
            <ErrorContainer>
              <ErrorAlert variant="error">
                <ErrorContent>
                  <HiExclamationTriangle />
                  <span>{error}</span>
                </ErrorContent>
              </ErrorAlert>
            </ErrorContainer>
          )}

          {/* Groups Grid */}
          {groups.length > 0 ? (
            <GroupsGrid>
              {groups.map((group: Group) => (
                <GroupCard key={group.group_id} group={group} />
              ))}
            </GroupsGrid>
          ) : (
            <EmptyStateContainer>
              <EmptyStateCard variant="outlined" elevation="medium">
                <EmptyStateContent>
                  <EmptyStateIcon>
                    <HiFilm />
                  </EmptyStateIcon>
                  <EmptyStateTitle>No groups yet</EmptyStateTitle>
                  <EmptyStateDescription>
                    Create your first group to start discovering amazing content
                    together
                  </EmptyStateDescription>
                  <EmptyStateButton
                    variant="primary"
                    onClick={handleCreateGroupNavigation}
                  >
                    Create Group
                  </EmptyStateButton>
                </EmptyStateContent>
              </EmptyStateCard>
            </EmptyStateContainer>
          )}
        </MainContent>

        {/* Create Relationship Modal */}
        <Modal
          isOpen={showCreateRelationshipModal}
          onClose={() => setShowCreateRelationshipModal(false)}
          title="Create Your First Relationship"
          size="medium"
        >
          <CreateRelationshipForm
            onSubmit={handleCreateRelationship}
            onCancel={() => setShowCreateRelationshipModal(false)}
            loading={loading}
          />
        </Modal>

        {/* Create Group Modal */}
        <Modal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          title=""
          size="large"
          showCloseButton={false}
        >
          <CreateGroupForm
            onSubmit={handleCreateGroupModal}
            onCancel={() => setShowCreateGroupModal(false)}
            loading={loading}
          />
        </Modal>
      </ContentContainer>
    </Container>
  );
}
