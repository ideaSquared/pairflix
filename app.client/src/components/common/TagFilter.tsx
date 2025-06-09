import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const TagFilterButton = styled.button<{ $active: boolean }>`
  background: ${props =>
    props.$active
      ? props.theme.colors.primary
      : props.theme.colors.background.secondary};
  color: ${props =>
    props.$active ? 'white' : props.theme.colors.text.primary};
  border: 1px solid
    ${props =>
      props.$active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  padding: 0.25rem 0.75rem;
  font-size: ${props => props.theme.typography?.fontSize?.sm || '0.875rem'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props =>
      props.$active
        ? props.theme.colors.primaryHover
        : props.theme.colors.border};
  }

  @media (max-width: 768px) {
    padding: 0.15rem 0.5rem;
    font-size: ${props => props.theme.typography?.fontSize?.xs || '0.75rem'};
  }
`;

const ClearButton = styled.button`
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: none;
  padding: 0.25rem 0.5rem;
  font-size: ${props => props.theme.typography?.fontSize?.sm || '0.875rem'};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${props => props.theme.colors.text.primary};
  }

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography?.fontSize?.xs || '0.75rem'};
  }
`;

const AllButton = styled(TagFilterButton)`
  font-weight: bold;
`;

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onChange,
}) => {
  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    onChange([]);
  };

  return (
    <FilterContainer>
      <AllButton $active={selectedTags.length === 0} onClick={clearFilters}>
        All
      </AllButton>

      {tags.map(tag => (
        <TagFilterButton
          key={tag}
          $active={selectedTags.includes(tag)}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </TagFilterButton>
      ))}

      {selectedTags.length > 0 && (
        <ClearButton onClick={clearFilters}>Clear filters</ClearButton>
      )}
    </FilterContainer>
  );
};

export default TagFilter;
