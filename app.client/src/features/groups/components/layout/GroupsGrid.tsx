import React from 'react';
import styled from 'styled-components';

interface GroupsGridProps {
  children: React.ReactNode;
  className?: string;
}

// Styled components
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.md || '768px'}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
    padding: 0 2rem;
  }

  @media (min-width: ${({ theme }) => theme?.breakpoints?.lg || '1024px'}) {
    grid-template-columns: repeat(2, 1fr);
    gap: 3.5rem;
  }

  @media (min-width: ${({ theme }) => theme?.breakpoints?.xl || '1200px'}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }

  @media (min-width: 1600px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
  }
`;

const GroupCardWrapper = styled.div`
  transform: scale(1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: ${({ theme }) => theme?.borderRadius?.lg || '12px'};

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
`;

export default function GroupsGrid({ children, className }: GroupsGridProps) {
  return (
    <Grid className={className}>
      {React.Children.map(children, child => (
        <GroupCardWrapper>{child}</GroupCardWrapper>
      ))}
    </Grid>
  );
}
