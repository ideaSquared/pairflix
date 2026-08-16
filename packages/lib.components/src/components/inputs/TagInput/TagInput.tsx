import clsx from 'clsx';
import React, { type KeyboardEvent, useState } from 'react';
import { Button } from '../Button';
import {
  helperText,
  removeTagButton,
  tag,
  tagInputContainer,
  tagInputField,
  tagTextInput,
  tagsContainer,
} from './TagInput.css';

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
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags);
  };

  return (
    <div className={clsx(tagInputContainer, className)}>
      <div className={tagInputField}>
        <input
          className={tagTextInput}
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
      </div>

      {tags.length === 0 && (
        <p className={helperText}>Press Enter or click Add to create tags</p>
      )}

      {tags.length >= maxTags && (
        <p className={helperText}>Maximum {maxTags} tags allowed</p>
      )}

      {tags.length > 0 && (
        <div className={tagsContainer}>
          {tags.map((t, index) => (
            <div key={index} className={tag}>
              {t}
              <button className={removeTagButton} onClick={() => removeTag(t)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
