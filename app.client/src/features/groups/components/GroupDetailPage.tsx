import { Alert, Badge, Button, Card } from '@pairflix/components';
import { useEffect, useState } from 'react';
import {
  HiCalendarDays,
  HiChartBar,
  HiCheckCircle,
  HiCog6Tooth,
  HiEnvelope,
  HiExclamationTriangle,
  HiFilm,
  HiGlobeAlt,
  HiHandRaised,
  HiHeart,
  HiPencilSquare,
  HiRocketLaunch,
  HiSparkles,
  HiUsers,
} from 'react-icons/hi2';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { keyframes, useTheme } from 'styled-components';
import { groupsApi } from '../../../services/api/groups';
import type { Group, GroupType } from '../../../types/group';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f9fafb'};
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const MainContent = styled.div`
  max-width: 1536px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Loading Components
const LoadingContainer = styled(PageContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  animation: ${spin} 1s linear infinite;
  border-radius: 50%;
  height: 4rem;
  width: 4rem;
  border-bottom: 2px solid ${({ theme }) => theme?.colors?.primary || '#2563eb'};
  margin: 0 auto;
`;

const LoadingText = styled.div`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

// Error Components
const ErrorContainer = styled.div`
  max-width: 512px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ErrorIcon = styled.div`
  font-size: 3.75rem;
`;

const ErrorAlert = styled(Alert)`
  text-align: left;
`;

const ErrorContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Breadcrumb
const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme?.colors?.primary || '#2563eb'};
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;

  &:hover {
    color: ${({ theme }) => theme?.colors?.primaryHover || '#1d4ed8'};
  }
`;

const BreadcrumbSeparator = styled.span`
  margin: 0 0.5rem;
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

const BreadcrumbCurrent = styled.span`
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
`;

// Hero Section
const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const HeroHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeroLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeroIcon = styled.div`
  font-size: 3.75rem;
`;

const HeroTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HeroTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

const HeroBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const HeroActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.sm || '640px'}) {
    flex-direction: row;
    gap: 0.75rem;
  }
`;

// Quick Stats
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid
    ${({ theme }) => theme?.colors?.border?.default || '#e5e7eb'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
`;

const StatValue = styled.div<{ $color?: string }>`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ $color }) => $color || '#2563eb'};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

// Main Layout
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.lg || '1024px'}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Section Components
const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SectionHeaderWithAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xl || '1.5rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

const SectionTitleSmall = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

// About Section
const AboutDescription = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#374151'};
  line-height: 1.6;
  margin: 0;
`;

const NoDescriptionContainer = styled.div`
  text-align: center;
  padding: 2rem 0;
`;

const NoDescriptionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const NoDescriptionText = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

// Schedule Info
const ScheduleContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) =>
    theme?.colors?.background?.highlight || '#eff6ff'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
`;

const ScheduleContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ScheduleIcon = styled.span`
  font-size: 1.25rem;
`;

const ScheduleText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ScheduleTitle = styled.div`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.primary || '#1e3a8a'};
`;

const ScheduleDetails = styled.div`
  color: ${({ theme }) => theme?.colors?.primaryHover || '#1d4ed8'};
`;

// Members Section
const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f9fafb'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme?.colors?.background?.hover || '#f3f4f6'};
  }
`;

const MemberLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MemberAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme?.colors?.primary || '#3b82f6'} 0%,
    ${({ theme }) => theme?.colors?.status?.watchTogetherFocused || '#7c3aed'}
      100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MemberName = styled.p`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

const MemberEmail = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const MemberBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Empty States
const EmptyStateContainer = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const EmptyStateIcon = styled.div`
  font-size: 3.75rem;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0 0 0.5rem 0;
`;

const EmptyStateDescription = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0 0 1rem 0;
`;

const ComingSoonContainer = styled.div`
  text-align: center;
  padding: 3rem 0;
`;

const ComingSoonIcon = styled.div`
  font-size: 3.75rem;
  margin-bottom: 1rem;
`;

const ComingSoonTitle = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0 0 0.5rem 0;
`;

const ComingSoonDescription = styled.p`
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  max-width: 448px;
  margin: 0 auto;
`;

// Settings Section
const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f9fafb'};
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
`;

const SettingLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SettingIcon = styled.span`
  font-size: 1rem;
`;

const SettingLabel = styled.span`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
`;

const SettingValue = styled.span`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
`;

const SettingContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FullWidthButton = styled(Button)`
  width: 100%;
`;

// Creator Section
const CreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CreatorAvatar = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme?.colors?.status?.watchTogetherFocused || '#7c3aed'}
      0%,
    ${({ theme }) =>
        theme?.colors?.status?.watchTogetherBackground || '#ec4899'}
      100%
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.bold || '700'};
  font-size: ${({ theme }) => theme?.typography?.fontSize?.lg || '1.25rem'};
`;

const CreatorDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CreatorName = styled.p`
  font-weight: ${({ theme }) => theme?.typography?.fontWeight?.medium || '500'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#111827'};
  margin: 0;
`;

const CreatorEmail = styled.p`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '0.875rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  margin: 0;
`;

const CreatedDate = styled.div`
  font-size: ${({ theme }) => theme?.typography?.fontSize?.xs || '0.75rem'};
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#6b7280'};
  padding-top: 0.5rem;
  border-top: 1px solid
    ${({ theme }) => theme?.colors?.border?.light || '#e5e7eb'};
`;

// Quick Actions
const ActionButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const getGroupTypeIcon = (type: string) => {
  switch (type) {
    case 'couple':
      return <HiHeart />;
    case 'friends':
      return <HiUsers />;
    case 'watch_party':
      return <HiFilm />;
    default:
      return <HiUsers />;
  }
};

const getGroupTypeName = (type: string): string => {
  switch (type) {
    case 'couple':
      return 'Couple';
    case 'friends':
      return 'Friends';
    case 'watch_party':
      return 'Watch Party';
    default:
      return 'Group';
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'archived':
      return 'secondary';
    default:
      return 'default';
  }
};

const getGroupTypeColor = (type: GroupType, theme: any): string => {
  switch (type) {
    case 'couple':
      return theme?.colors?.status?.watchTogetherBackground || '#fce7f3';
    case 'friends':
      return theme?.colors?.primary || '#3b82f6';
    case 'watch_party':
      return theme?.colors?.text?.warning || '#f59e0b';
    default:
      return theme?.colors?.primary || '#3b82f6';
  }
};

export default function GroupDetailPage() {
  const theme = useTheme();
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
      navigate('/groups');
      return;
    }

    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // For now, we need to get the group from the groups list
        // since there's no dedicated endpoint for getting a single group
        const allGroups = await groupsApi.getUserGroups();
        const foundGroup = allGroups.find(g => g.group_id === groupId);

        if (!foundGroup) {
          setError('Group not found');
          return;
        }

        setGroup(foundGroup);

        // TODO: Fetch group members when the API is available
        // const membersData = await groupsApi.getGroupMembers(groupId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load group details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, navigate]);

  const handleBackToGroups = () => {
    navigate('/groups');
  };

  const handleInviteMembers = () => {
    // TODO: Implement invite members functionality
    console.log('Invite members functionality not yet implemented');
  };

  const handleManageGroup = () => {
    // TODO: Implement group management functionality
    console.log('Group management functionality not yet implemented');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <LoadingSpinner />
          <LoadingText>Loading group details...</LoadingText>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (error || !group) {
    return (
      <PageContainer>
        <ContentContainer>
          <ErrorContainer>
            <ErrorIcon>❌</ErrorIcon>
            <ErrorAlert variant="error">
              <ErrorContent>
                <HiExclamationTriangle />
                <span>{error || 'Group not found'}</span>
              </ErrorContent>
            </ErrorAlert>
            <Button onClick={handleBackToGroups} variant="outline">
              ← Back to Groups
            </Button>
          </ErrorContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <MainContent>
          {/* Breadcrumb & Header */}
          <Breadcrumb>
            <BreadcrumbLink onClick={handleBackToGroups}>Groups</BreadcrumbLink>
            <BreadcrumbSeparator>•</BreadcrumbSeparator>
            <BreadcrumbCurrent>{group.name}</BreadcrumbCurrent>
          </Breadcrumb>

          {/* Hero Section */}
          <Card
            variant="primary"
            elevation="medium"
            accentColor={getGroupTypeColor(group.type, theme)}
          >
            <HeroContent>
              <HeroHeader>
                <HeroLeft>
                  <HeroIcon>{getGroupTypeIcon(group.type)}</HeroIcon>
                  <HeroTextContainer>
                    <HeroTitle>{group.name}</HeroTitle>
                    <HeroBadges>
                      <Badge variant="info" pill>
                        {getGroupTypeName(group.type)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(group.status)} pill>
                        {group.status}
                      </Badge>
                      {group.settings.isPublic && (
                        <Badge variant="secondary" outlined pill>
                          <HiGlobeAlt style={{ marginRight: '0.25rem' }} />
                          Public
                        </Badge>
                      )}
                    </HeroBadges>
                  </HeroTextContainer>
                </HeroLeft>

                <HeroActions>
                  <Button onClick={handleInviteMembers} variant="outline">
                    <HiEnvelope style={{ marginRight: '0.5rem' }} />
                    Invite Members
                  </Button>
                  <Button onClick={handleManageGroup}>
                    <HiCog6Tooth style={{ marginRight: '0.5rem' }} />
                    Manage Group
                  </Button>
                </HeroActions>
              </HeroHeader>

              {/* Quick Stats */}
              <StatsGrid>
                <StatCard>
                  <StatIcon>
                    <HiChartBar />
                  </StatIcon>
                  <StatValue
                    $color={(theme as any)?.colors?.primary || '#2563eb'}
                  >
                    {group.member_count || 0}
                  </StatValue>
                  <StatLabel>Members</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon>
                    <HiCheckCircle />
                  </StatIcon>
                  <StatValue
                    $color={
                      (theme as any)?.colors?.status?.finished || '#16a34a'
                    }
                  >
                    {group.status === 'active' ? 1 : 0}
                  </StatValue>
                  <StatLabel>Active</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon>
                    <HiCalendarDays />
                  </StatIcon>
                  <StatValue
                    $color={
                      (theme as any)?.colors?.status?.watchTogetherFocused ||
                      '#9333ea'
                    }
                  >
                    {group.settings.scheduleSettings?.recurringDay ? 1 : 0}
                  </StatValue>
                  <StatLabel>Scheduled</StatLabel>
                </StatCard>
                <StatCard>
                  <StatIcon>
                    <HiFilm />
                  </StatIcon>
                  <StatValue
                    $color={(theme as any)?.colors?.text?.warning || '#ea580c'}
                  >
                    0
                  </StatValue>
                  <StatLabel>Movies</StatLabel>
                </StatCard>
              </StatsGrid>
            </HeroContent>
          </Card>

          <ContentGrid>
            {/* Main Content */}
            <MainColumn>
              {/* About Section */}
              <Card variant="outlined" elevation="low">
                <SectionContent>
                  <SectionHeader>
                    <SectionIcon>
                      <HiPencilSquare />
                    </SectionIcon>
                    <SectionTitle>About</SectionTitle>
                  </SectionHeader>

                  {group.description ? (
                    <AboutDescription>{group.description}</AboutDescription>
                  ) : (
                    <NoDescriptionContainer>
                      <NoDescriptionIcon>
                        <HiSparkles />
                      </NoDescriptionIcon>
                      <NoDescriptionText>
                        No description provided
                      </NoDescriptionText>
                    </NoDescriptionContainer>
                  )}

                  {group.settings.scheduleSettings?.recurringDay && (
                    <ScheduleContainer>
                      <ScheduleContent>
                        <ScheduleIcon>
                          <HiCalendarDays />
                        </ScheduleIcon>
                        <ScheduleText>
                          <ScheduleTitle>Regular Schedule</ScheduleTitle>
                          <ScheduleDetails>
                            Every {group.settings.scheduleSettings.recurringDay}{' '}
                            at {group.settings.scheduleSettings.recurringTime}
                          </ScheduleDetails>
                        </ScheduleText>
                      </ScheduleContent>
                    </ScheduleContainer>
                  )}
                </SectionContent>
              </Card>

              {/* Members Section */}
              <Card variant="outlined" elevation="low">
                <SectionContent>
                  <SectionHeaderWithAction>
                    <SectionHeader>
                      <SectionIcon>
                        <HiUsers />
                      </SectionIcon>
                      <SectionTitle>
                        Members (
                        {group.member_count || group.members?.length || 0})
                      </SectionTitle>
                    </SectionHeader>
                    <Button onClick={handleInviteMembers} variant="outline">
                      + Invite
                    </Button>
                  </SectionHeaderWithAction>

                  {group.members && group.members.length > 0 ? (
                    <MembersList>
                      {group.members.map(member => (
                        <MemberItem key={member.user_id}>
                          <MemberLeft>
                            <MemberAvatar>
                              {member.user?.username?.[0]?.toUpperCase() || '?'}
                            </MemberAvatar>
                            <MemberInfo>
                              <MemberName>
                                {member.user?.username || 'Unknown User'}
                              </MemberName>
                              <MemberEmail>{member.user?.email}</MemberEmail>
                            </MemberInfo>
                          </MemberLeft>
                          <MemberBadges>
                            <Badge
                              variant={
                                member.role === 'owner'
                                  ? 'primary'
                                  : member.role === 'admin'
                                    ? 'info'
                                    : 'secondary'
                              }
                              size="small"
                              pill
                            >
                              {member.role}
                            </Badge>
                            <Badge
                              variant={
                                member.status === 'active'
                                  ? 'success'
                                  : member.status === 'pending'
                                    ? 'warning'
                                    : 'secondary'
                              }
                              size="small"
                              pill
                            >
                              {member.status}
                            </Badge>
                          </MemberBadges>
                        </MemberItem>
                      ))}
                    </MembersList>
                  ) : (
                    <EmptyStateContainer>
                      <EmptyStateIcon>
                        <HiHandRaised />
                      </EmptyStateIcon>
                      <EmptyStateTitle>No members yet</EmptyStateTitle>
                      <EmptyStateDescription>
                        Start building your group by inviting friends
                      </EmptyStateDescription>
                      <Button onClick={handleInviteMembers}>
                        <HiEnvelope style={{ marginRight: '0.5rem' }} />
                        Invite First Member
                      </Button>
                    </EmptyStateContainer>
                  )}
                </SectionContent>
              </Card>

              {/* Activity Placeholder */}
              <Card variant="outlined" elevation="low">
                <SectionContent>
                  <SectionHeader>
                    <SectionIcon>
                      <HiFilm />
                    </SectionIcon>
                    <SectionTitle>Recent Activity</SectionTitle>
                  </SectionHeader>

                  <ComingSoonContainer>
                    <ComingSoonIcon>
                      <HiRocketLaunch />
                    </ComingSoonIcon>
                    <ComingSoonTitle>Coming Soon!</ComingSoonTitle>
                    <ComingSoonDescription>
                      Group activity, watch history, and recommendations will
                      appear here
                    </ComingSoonDescription>
                  </ComingSoonContainer>
                </SectionContent>
              </Card>
            </MainColumn>

            {/* Sidebar */}
            <Sidebar>
              {/* Group Settings */}
              <Card variant="outlined" elevation="low">
                <SectionContent>
                  <SectionHeader>
                    <SectionIcon>
                      <HiCog6Tooth />
                    </SectionIcon>
                    <SectionTitle>Group Settings</SectionTitle>
                  </SectionHeader>

                  <SettingsList>
                    <SettingItem>
                      <SettingLeft>
                        <SettingIcon>
                          <HiCheckCircle />
                        </SettingIcon>
                        <SettingContent>
                          <SettingLabel>Approval Required</SettingLabel>
                          <SettingValue>
                            {group.settings.requireApproval ? 'Yes' : 'No'}
                          </SettingValue>
                        </SettingContent>
                      </SettingLeft>
                    </SettingItem>

                    <SettingItem>
                      <SettingLeft>
                        <SettingIcon>
                          <HiEnvelope />
                        </SettingIcon>
                        <SettingContent>
                          <SettingLabel>Member Invites</SettingLabel>
                          <SettingValue>
                            {group.settings.allowInvites
                              ? 'Allowed'
                              : 'Disabled'}
                          </SettingValue>
                        </SettingContent>
                      </SettingLeft>
                    </SettingItem>
                  </SettingsList>

                  <FullWidthButton
                    onClick={handleManageGroup}
                    variant="outline"
                  >
                    Edit Settings
                  </FullWidthButton>
                </SectionContent>
              </Card>

              {/* Creator Info */}
              {group.creator && (
                <Card variant="outlined" elevation="low">
                  <SectionContent>
                    <SectionHeader>
                      <SectionIcon>👑</SectionIcon>
                      <SectionTitleSmall>Creator</SectionTitleSmall>
                    </SectionHeader>

                    <CreatorInfo>
                      <CreatorAvatar>
                        {group.creator.username[0]?.toUpperCase()}
                      </CreatorAvatar>
                      <CreatorDetails>
                        <CreatorName>{group.creator.username}</CreatorName>
                        <CreatorEmail>{group.creator.email}</CreatorEmail>
                      </CreatorDetails>
                    </CreatorInfo>

                    <CreatedDate>
                      Created on{' '}
                      {new Date(group.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CreatedDate>
                  </SectionContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card variant="outlined" elevation="low">
                <SectionContent>
                  <SectionHeader>
                    <SectionIcon>⚡</SectionIcon>
                    <SectionTitleSmall>Quick Actions</SectionTitleSmall>
                  </SectionHeader>

                  <ActionButtonsContainer>
                    <ActionButton variant="primary">
                      <HiEnvelope style={{ marginRight: '0.5rem' }} />
                      Invite Members
                    </ActionButton>
                    <ActionButton variant="secondary">
                      <HiFilm style={{ marginRight: '0.5rem' }} />
                      Plan Watch Party
                    </ActionButton>
                    <ActionButton variant="outline">
                      <HiChartBar style={{ marginRight: '0.5rem' }} />
                      View Analytics
                    </ActionButton>
                  </ActionButtonsContainer>
                </SectionContent>
              </Card>
            </Sidebar>
          </ContentGrid>
        </MainContent>
      </ContentContainer>
    </PageContainer>
  );
}
