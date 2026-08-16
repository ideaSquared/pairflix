import clsx from 'clsx';
import React from 'react';
import {
  allButton,
  clearButton,
  filterContainer,
  tagFilterButton,
} from './TagFilter.css';

export interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  showAllButton?: boolean;
  showClearButton?: boolean;
}

/**
 * TagFilter component for filtering content by tags
 * Supports multi-select filtering with visual feedback
 */
const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onChange,
  className,
  showAllButton = true,
  showClearButton = true,
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
    <div className={clsx(filterContainer, className)}>
      {showAllButton && (
        <button
          className={clsx(
            tagFilterButton({ active: selectedTags.length === 0 }),
            allButton
          )}
          onClick={clearFilters}
        >
          All
        </button>
      )}

      {tags.map(tag => (
        <button
          key={tag}
          className={tagFilterButton({ active: selectedTags.includes(tag) })}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </button>
      ))}

      {showClearButton && selectedTags.length > 0 && (
        <button className={clearButton} onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  );
};

export default TagFilter;
