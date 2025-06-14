# Unified Groups Implementation Guide

This document outlines the **unified groups model** that replaces both the existing 1-to-1 matching system and adds multi-user groups in PairFlix.

## Architecture Overview

### Old System (1-to-1 Matches)

- Users could only have one match
- Limited to two people
- Separate Match model and UI

### New Unified System (Groups for Everything)

- **Everything is a group** with different types and member limits
- **Natural progression**: couple → friends → watch party
- **Single relationship model** that scales from 2 to 50 members
- **No separate match/group conversion** - seamless evolution

## Database Schema

### Single Unified Model:

1. **Group Model** (`groups` table)

   - Types: `couple` (2 members), `friends` (2-15 members), `watch_party` (2-50 members)
   - Flexible settings and member limits
   - Natural evolution between types

2. **GroupMember Model** (`group_members` table)

   - Handles all relationships (couples, friends, watch parties)
   - Roles: `owner`, `admin`, `member`
   - Status: `pending`, `active`, `inactive`, `removed`

3. **GroupWatchlist Model** (`group_watchlist` table)
   - Shared watchlist for any group size
   - Voting system scales from couples to large groups

## Natural Relationship Evolution

### 1. Dating/Couples (Start Here)

```javascript
// User invites partner via email
const relationship = await groups.createRelationship({
  partner_email: 'partner@example.com',
  group_name: 'John & Jane', // Optional custom name
  description: 'Our movie nights',
});
// Creates a 2-person "couple" group
```

### 2. Add Friends (Expand Naturally)

```javascript
// Expand couple to friends group
const friendsGroup = await groups.expandRelationship(groupId, {
  new_type: 'friends',
  new_max_members: 8,
  new_name: 'Movie Night Crew',
});
// Same group, now allows more members and invites
```

### 3. Large Watch Parties (Scale Further)

```javascript
// Expand to public watch party
const watchParty = await groups.expandRelationship(groupId, {
  new_type: 'watch_party',
  new_max_members: 20,
  new_name: 'Thursday Movie Nights',
});
// Same group, now public with scheduling features
```

## Frontend Implementation

### 1. Simplified Navigation

Since frontend only supports one relationship, this is perfect:

```javascript
// app.client/src/config/navigation.ts
const config: NavigationConfig = {
  sections: [
    {
      items: [
        {
          key: 'watchlist',
          label: 'My Watchlist',
          path: '/watchlist',
          icon: React.createElement(HiListBullet),
        },
        // CHANGED: Single relationship instead of "matches"
        {
          key: 'relationship',
          label: 'My Group',
          path: '/relationship',
          icon: React.createElement(HiUsers),
        },
        {
          key: 'activity',
          label: 'Activity',
          path: '/activity',
          icon: React.createElement(HiChartBarSquare),
        },
      ],
    },
  ],
};
```

### 2. Unified API Service

Replace `matches` API with unified `relationships`:

```javascript
// app.client/src/services/api/relationships.ts
export const relationships = {
  // Get primary relationship (replaces getMatches)
  getPrimary: async () => {
    return fetchWithAuth('/api/groups/relationship');
  },

  // Create relationship (replaces match creation)
  create: async (partnerEmail: string, groupName?: string) => {
    return fetchWithAuth('/api/groups/relationship', {
      method: 'POST',
      body: JSON.stringify({
        partner_email: partnerEmail,
        group_name: groupName
      }),
    });
  },

  // Accept relationship invitation
  accept: async (groupId: string) => {
    return fetchWithAuth(`/api/groups/${groupId}/accept`, {
      method: 'POST',
    });
  },

  // Expand relationship (couple → friends → watch party)
  expand: async (groupId: string, newType: string, maxMembers?: number) => {
    return fetchWithAuth(`/api/groups/${groupId}/expand`, {
      method: 'PUT',
      body: JSON.stringify({
        new_type: newType,
        new_max_members: maxMembers
      }),
    });
  },

  // Get content matches for group
  getContentMatches: async (groupId: string) => {
    return fetchWithAuth(`/api/groups/${groupId}/matches`);
  },

  // Invite friends to group
  invite: async (groupId: string, userIds: string[]) => {
    return fetchWithAuth(`/api/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds }),
    });
  },
};
```

### 3. Unified Relationship Page

Replace `MatchPage` with `RelationshipPage`:

```javascript
// app.client/src/features/relationships/RelationshipPage.tsx
const RelationshipPage: React.FC = () => {
  const { data: relationship, isLoading } = useQuery(
    ['relationship'],
    () => relationships.getPrimary()
  );

  const { data: pendingInvitations = [] } = useQuery(
    ['invitations'],
    () => relationships.getInvitations()
  );

  if (isLoading) return <LoadingSpinner />;

  // No relationship yet - show invitation form
  if (!relationship) {
    return (
      <PageContainer>
        <H1>Start Your Movie Journey</H1>

        {pendingInvitations.length > 0 && (
          <PendingInvitationsCard invitations={pendingInvitations} />
        )}

        <InvitePartnerCard />
      </PageContainer>
    );
  }

  // Has relationship - show unified interface
  return (
    <PageContainer>
      <RelationshipHeader relationship={relationship} />

      <Grid gap="xl">
        <div>
          <ContentMatches groupId={relationship.group_id} />
        </div>

        <div>
          <GroupMembers members={relationship.members} />

          {/* Natural expansion options */}
          {relationship.type === 'couple' && (
            <ExpandToFriendsCard groupId={relationship.group_id} />
          )}

          {relationship.type === 'friends' && (
            <ExpandToWatchPartyCard groupId={relationship.group_id} />
          )}

          {relationship.settings.allowInvites && (
            <InviteFriendsCard groupId={relationship.group_id} />
          )}
        </div>
      </Grid>
    </PageContainer>
  );
};
```

### 4. Progressive Enhancement Components

```javascript
// Expansion cards that guide users naturally
const ExpandToFriendsCard: React.FC<{ groupId: string }> = ({ groupId }) => {
  const expandMutation = useMutation(
    ({ newType, maxMembers }: { newType: string; maxMembers: number }) =>
      relationships.expand(groupId, newType, maxMembers)
  );

  return (
    <Card variant="primary">
      <CardContent>
        <H3>Invite Friends?</H3>
        <Typography>
          Turn your couple group into a friends circle and invite others
          to discover movies together.
        </Typography>
        <Button
          onClick={() => expandMutation.mutate({ newType: 'friends', maxMembers: 8 })}
          variant="secondary"
        >
          Add Friends
        </Button>
      </CardContent>
    </Card>
  );
};
```

## Migration Strategy

### Phase 1: Backend Migration ✅

- [x] Create unified Group models
- [x] Remove Match model dependencies
- [x] Create relationship-focused services
- [x] Update API endpoints

### Phase 2: Frontend Refactor

- [ ] Replace `MatchPage` with `RelationshipPage`
- [ ] Update navigation from "Matches" to "My Group"
- [ ] Create expansion flow components
- [ ] Update API calls to use groups endpoints

### Phase 3: Data Migration

```sql
-- Migrate existing matches to couple groups
INSERT INTO groups (name, type, max_members, created_by, settings)
SELECT
  CONCAT(u1.username, ' & ', u2.username) as name,
  'couple' as type,
  2 as max_members,
  m.user1_id as created_by,
  '{"isPublic": false, "requireApproval": false, "allowInvites": false}' as settings
FROM matches m
JOIN users u1 ON m.user1_id = u1.user_id
JOIN users u2 ON m.user2_id = u2.user_id
WHERE m.status = 'accepted';

-- Create group memberships for both users
INSERT INTO group_members (group_id, user_id, role, status)
SELECT g.group_id, m.user1_id, 'owner', 'active'
FROM groups g, matches m WHERE /* match conditions */;
```

### Phase 4: Polish & Features

- [ ] Group watchlist voting
- [ ] Watch party scheduling
- [ ] Mobile optimization
- [ ] Performance tuning

## Benefits of Unified Model

### 1. **Perfect for Your Constraint**

- Frontend supports one relationship ✅
- Natural progression path ✅
- No complex match/group conversions ✅

### 2. **Simpler Architecture**

- One relationship model instead of two
- Single API endpoint set
- Unified UI components

### 3. **Better User Experience**

- Start simple (2 people)
- Grow naturally (add friends)
- Scale organically (watch parties)
- No jarring "conversion" steps

### 4. **Future-Proof**

- Easily support multiple groups later
- Natural expansion for different group types
- Flexible member limits and settings

## Example User Journeys

### Simple Couple:

1. **Invite partner** via email
2. **Partner accepts** → 2-person couple group
3. **Discover content** together
4. **Stay as couple** or expand later

### Growing Friend Circle:

1. **Start as couple** (2 people)
2. **Expand to friends** (allow 8 members)
3. **Invite 3-4 friends**
4. **Group content discovery**
5. **Shared voting** on what to watch

### Watch Party Evolution:

1. **Friends group** (6 people)
2. **Expand to watch party** (allow 20 members)
3. **Make public** for discovery
4. **Set recurring schedule** (Thursday 8PM)
5. **Weekly movie selection**

This unified approach eliminates the complexity of separate match/group systems while providing a natural growth path that works perfectly with your frontend's one-relationship constraint.
