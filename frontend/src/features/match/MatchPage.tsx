import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components';
import Badge from '../../components/layout/Badge';
import Layout from '../../components/layout/Layout';
import { ContentMatch, Match, matches as matchesApi, watchlist } from '../../services/api';
import InviteUser from './InviteUser';

const Container = styled.div`
    display: flex;
    gap: 2rem;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Section = styled.div`
    flex: 1;
    min-width: 0; // Prevent content from overflowing

    @media (max-width: 768px) {
        margin-bottom: 2rem;
    }
`;

const MatchCard = styled.div`
    background: #1a1a1a;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    word-break: break-word; // Handle long email addresses
`;

const Button = styled.button<{ variant?: 'accept' | 'reject' }>`
    background: ${({ variant }) => 
        variant === 'accept' ? '#00cc00' : 
        variant === 'reject' ? '#cc0000' : 
        '#646cff'};
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
    &:hover {
        opacity: 0.8;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const Status = styled.span<{ status: string }>`
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: ${({ status }) => 
        status === 'accepted' ? '#00cc00' :
        status === 'rejected' ? '#cc0000' :
        '#646cff'};
    color: white;
`;

const PosterImage = styled.img`
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 0.5rem;
`;

const Overview = styled.p`
    font-size: 0.875rem;
    color: #999;
    margin: 0.5rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const NoMatches = styled.div`
    text-align: center;
    padding: 2rem;
    color: #666;
`;

const MatchPage: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: contentMatches = [], isLoading: isContentLoading } = useQuery<ContentMatch[]>(
        ['watchlist-matches'], 
        watchlist.getMatches
    );
    
    const { data: userMatches = [], isLoading: isUserLoading } = useQuery<Match[]>(
        ['matches'], 
        matchesApi.getAll
    );

    const updateMatchMutation = useMutation(
        ({ match_id, status }: { match_id: string; status: 'accepted' | 'rejected' }) =>
            matchesApi.updateStatus(match_id, status),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['matches']);
            },
        }
    );

    if (isUserLoading || isContentLoading) {
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
    }

    const pendingMatches = userMatches.filter(match => match.status === 'pending');
    const activeMatches = userMatches.filter(match => match.status === 'accepted');

    return (
        <Layout>
            <h1>Matches</h1>
            <Container>
                <Section>
                    <InviteUser onSuccess={() => queryClient.invalidateQueries(['matches'])} />
                    
                    <h2>Match Requests {pendingMatches.length > 0 && `(${pendingMatches.length})`}</h2>
                    {pendingMatches.length === 0 ? (
                        <NoMatches>No pending match requests</NoMatches>
                    ) : (
                        pendingMatches.map((match: Match) => (
                            <MatchCard key={match.match_id}>
                                <p>From: {match.user1?.email}</p>
                                <ButtonGroup>
                                    <Button
                                        variant="accept"
                                        onClick={() => updateMatchMutation.mutate({ 
                                            match_id: match.match_id, 
                                            status: 'accepted' 
                                        })}
                                        disabled={updateMatchMutation.isLoading}
                                    >
                                        {updateMatchMutation.isLoading ? 'Accepting...' : 'Accept'}
                                    </Button>
                                    <Button
                                        variant="reject"
                                        onClick={() => updateMatchMutation.mutate({ 
                                            match_id: match.match_id, 
                                            status: 'rejected' 
                                        })}
                                        disabled={updateMatchMutation.isLoading}
                                    >
                                        {updateMatchMutation.isLoading ? 'Rejecting...' : 'Reject'}
                                    </Button>
                                </ButtonGroup>
                            </MatchCard>
                        ))
                    )}

                    <h2>Active Matches {activeMatches.length > 0 && `(${activeMatches.length})`}</h2>
                    {activeMatches.length === 0 ? (
                        <NoMatches>No active matches yet</NoMatches>
                    ) : (
                        activeMatches.map((match: Match) => (
                            <MatchCard key={match.match_id}>
                                <p>Matched with: {match.user1?.email}</p>
                                <Status status={match.status}>{match.status}</Status>
                            </MatchCard>
                        ))
                    )}
                </Section>

                <Section>
                    <h2>Content Matches {contentMatches.length > 0 && `(${contentMatches.length})`}</h2>
                    <p>Shows and movies you both want to watch</p>
                    {contentMatches.length === 0 ? (
                        <NoMatches>No content matches found. Add more shows to your watchlist!</NoMatches>
                    ) : (
                        contentMatches.map((match: ContentMatch) => (
                            <MatchCard key={match.tmdb_id}>
                                {match.poster_path && (
                                    <PosterImage 
                                        src={`https://image.tmdb.org/t/p/w500${match.poster_path}`}
                                        alt={match.title}
                                    />
                                )}
                                <h3>{match.title}</h3>
                                <Badge variant={match.media_type}>{match.media_type}</Badge>
                                {match.overview && <Overview>{match.overview}</Overview>}
                                <div>
                                    <p>You: <Status status={match.user1_status}>{match.user1_status}</Status></p>
                                    <p>Partner: <Status status={match.user2_status}>{match.user2_status}</Status></p>
                                </div>
                            </MatchCard>
                        ))
                    )}
                </Section>
            </Container>
        </Layout>
    );
};

export default MatchPage;
