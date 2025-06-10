import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TagFilter from './TagFilter';

/**
 * The TagFilter component allows users to filter content by selecting multiple tags.
 * It provides visual feedback for selected tags and includes options for "All" and "Clear" actions.
 */
const meta: Meta<typeof TagFilter> = {
  title: 'Inputs/TagFilter',
  component: TagFilter,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible tag filter component that enables multi-select filtering with visual feedback and customizable controls.',
      },
    },
  },
  argTypes: {
    tags: {
      description: 'Array of available tags to filter by',
      control: 'object',
    },
    selectedTags: {
      description: 'Array of currently selected tags',
      control: 'object',
    },
    onChange: {
      description: 'Callback fired when tag selection changes',
      action: 'onChange',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
    showAllButton: {
      description: 'Whether to show the "All" button',
      control: 'boolean',
    },
    showClearButton: {
      description: 'Whether to show the "Clear filters" button',
      control: 'boolean',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagFilter>;

const sampleTags = [
  'React',
  'TypeScript',
  'JavaScript',
  'CSS',
  'HTML',
  'Node.js',
  'Python',
  'Design',
];

/**
 * Default TagFilter with no tags selected.
 * The "All" button is active when no filters are applied.
 */
const DefaultComponent = (args: StoryObj<typeof TagFilter>['args']) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  return (
    <TagFilter
      {...args}
      tags={sampleTags}
      selectedTags={selectedTags}
      onChange={setSelectedTags}
    />
  );
};

export const Default: Story = {
  render: DefaultComponent,
  args: {
    showAllButton: true,
    showClearButton: true,
  },
};

/**
 * TagFilter with some tags pre-selected.
 * Shows how the component looks with active filters.
 */
const WithSelectedTagsComponent = (
  args: StoryObj<typeof TagFilter>['args']
) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'React',
    'TypeScript',
  ]);
  return (
    <TagFilter
      {...args}
      tags={sampleTags}
      selectedTags={selectedTags}
      onChange={setSelectedTags}
    />
  );
};

export const WithSelectedTags: Story = {
  render: WithSelectedTagsComponent,
  args: {
    showAllButton: true,
    showClearButton: true,
  },
};

/**
 * TagFilter without the "All" button.
 * Useful when you don't want to provide an option to clear all filters at once.
 */
const WithoutAllButtonComponent = (
  args: StoryObj<typeof TagFilter>['args']
) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['JavaScript']);
  return (
    <TagFilter
      {...args}
      tags={sampleTags}
      selectedTags={selectedTags}
      onChange={setSelectedTags}
    />
  );
};

export const WithoutAllButton: Story = {
  render: WithoutAllButtonComponent,
  args: {
    showAllButton: false,
    showClearButton: true,
  },
};

/**
 * TagFilter without the "Clear filters" button.
 * Users can only clear filters by clicking individual tags or the "All" button.
 */
const WithoutClearButtonComponent = (
  args: StoryObj<typeof TagFilter>['args']
) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['CSS', 'HTML']);
  return (
    <TagFilter
      {...args}
      tags={sampleTags}
      selectedTags={selectedTags}
      onChange={setSelectedTags}
    />
  );
};

export const WithoutClearButton: Story = {
  render: WithoutClearButtonComponent,
  args: {
    showAllButton: true,
    showClearButton: false,
  },
};

/**
 * Minimal TagFilter without "All" or "Clear" buttons.
 * Only shows individual tag buttons for selection.
 */
const MinimalControlsComponent = (args: StoryObj<typeof TagFilter>['args']) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['Node.js']);
  return (
    <TagFilter
      {...args}
      tags={sampleTags}
      selectedTags={selectedTags}
      onChange={setSelectedTags}
    />
  );
};

export const MinimalControls: Story = {
  render: MinimalControlsComponent,
  args: {
    showAllButton: false,
    showClearButton: false,
  },
};

/**
 * TagFilter with a small set of tags.
 * Demonstrates how the component scales with fewer options.
 */
const FewTagsComponent = (args: StoryObj<typeof TagFilter>['args']) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const limitedTags = ['Frontend', 'Backend', 'Mobile'];
  return (
    <TagFilter
      {...args}
      tags={limitedTags}
      selectedTags={selectedTags}
      onChange={setSelectedTags}
    />
  );
};

export const FewTags: Story = {
  render: FewTagsComponent,
  args: {
    showAllButton: true,
    showClearButton: true,
  },
};

/**
 * Interactive TagFilter example with content filtering simulation.
 * Demonstrates how the filter might be used in a real application.
 */
const InteractiveComponent = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const mockContent = [
    { id: 1, title: 'React Component Guide', tags: ['React', 'JavaScript'] },
    {
      id: 2,
      title: 'TypeScript Best Practices',
      tags: ['TypeScript', 'JavaScript'],
    },
    { id: 3, title: 'CSS Grid Layout', tags: ['CSS', 'HTML'] },
    {
      id: 4,
      title: 'Node.js API Development',
      tags: ['Node.js', 'JavaScript'],
    },
    { id: 5, title: 'Python Data Analysis', tags: ['Python'] },
    { id: 6, title: 'UI/UX Design Principles', tags: ['Design'] },
  ];

  const filteredContent =
    selectedTags.length === 0
      ? mockContent
      : mockContent.filter(item =>
          selectedTags.some(tag => item.tags.includes(tag))
        );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '16px' }}>Content Filter Example</h3>
      <TagFilter
        tags={sampleTags}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        showAllButton={true}
        showClearButton={true}
      />

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '12px' }}>
          Filtered Results ({filteredContent.length} items)
        </h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredContent.map(item => (
            <div
              key={item.id}
              style={{
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h5 style={{ margin: '0 0 8px 0' }}>{item.title}</h5>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      backgroundColor: selectedTags.includes(tag)
                        ? '#007bff'
                        : '#e0e0e0',
                      color: selectedTags.includes(tag) ? 'white' : '#333',
                      borderRadius: '12px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

/**
 * TagFilter with custom styling applied.
 */
const CustomStylingComponent = (args: StoryObj<typeof TagFilter>['args']) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['React']);
  return (
    <div style={{ maxWidth: '600px' }}>
      <TagFilter
        {...args}
        tags={sampleTags.slice(0, 5)}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        className="custom-tag-filter"
      />
      <style>{`
        .custom-tag-filter {
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
        }
        .custom-tag-filter button {
          border-radius: 20px !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
};

export const CustomStyling: Story = {
  render: CustomStylingComponent,
  args: {
    showAllButton: true,
    showClearButton: true,
  },
};
