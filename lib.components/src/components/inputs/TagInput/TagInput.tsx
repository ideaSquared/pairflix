import React, { KeyboardEvent, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../Button';

const TagInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TagInputField = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.theme.colors?.border || '#d0d0d0'};
  border-radius: ${props => props.theme.borderRadius?.sm || '4px'};
  padding: 0.5rem;
  background: ${props => props.theme.colors?.background?.primary || '#ffffff'};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: ${props => props.theme.typography?.fontSize?.md || '1rem'};
  color: ${props => props.theme.colors?.text?.primary || '#000'};

  &::placeholder {
    color: ${props => props.theme.colors?.text?.secondary || '#666'};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  background: ${props => props.theme.colors?.primary || '#4853db'};
  color: white;
  border-radius: ${props => props.theme.borderRadius?.sm || '4px'};
  padding: 0.25rem 0.5rem;
  font-size: ${props => props.theme.typography?.fontSize?.sm || '0.875rem'};
  user-select: none;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: white;
  margin-left: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  padding: 0 0.25rem;
  font-size: ${props => props.theme.typography?.fontSize?.sm || '0.875rem'};

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: none;
  }
`;

const HelperText = styled.p`
  color: ${props => props.theme.colors?.text?.secondary || '#666'};
  font-size: ${props => props.theme.typography?.fontSize?.sm || '0.875rem'};
  margin: 0.25rem 0;
`;

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

/**
 * TagInput component for adding and managing tags
 * Supports keyboard shortcuts (Enter to add) and visual tag management
 */
const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Add a tag...',
  maxTags = 10,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim();
    if (!newTag) return;

    if (tags.length >= maxTags) {
      return;
    }

    if (!tags.includes(newTag)) {
      const newTags = [...tags, newTag];
      onChange(newTags);
      setInputValue('');
    } else {
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  return (
    <TagInputContainer className={className}>
      <TagInputField>
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={tags.length >= maxTags}
        />
        <Button
          onClick={addTag}
          disabled={!inputValue.trim() || tags.length >= maxTags}
          size="small"
        >
          Add
        </Button>
      </TagInputField>

      {tags.length === 0 && (
        <HelperText>Press Enter or click Add to create tags</HelperText>
      )}

      {tags.length >= maxTags && (
        <HelperText>Maximum {maxTags} tags allowed</HelperText>
      )}

      {tags.length > 0 && (
        <TagsContainer>
          {tags.map((tag, index) => (
            <Tag key={index}>
              {tag}
              <RemoveTagButton onClick={() => removeTag(tag)}>
                ×
              </RemoveTagButton>
            </Tag>
          ))}
        </TagsContainer>
      )}
    </TagInputContainer>
  );
};

export default TagInput;
