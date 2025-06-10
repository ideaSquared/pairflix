import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TagInput from './TagInput';

/**
 * The TagInput component allows users to add and manage tags with keyboard shortcuts
 * and visual feedback. It supports maximum tag limits and prevents duplicates.
 */
const meta: Meta<typeof TagInput> = {
  title: 'Inputs/TagInput',
  component: TagInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible tag input component that allows users to add, remove, and manage tags with keyboard shortcuts (Enter to add) and visual feedback.',
      },
    },
  },
  argTypes: {
    tags: {
      description: 'Array of current tags',
      control: 'object',
    },
    onChange: {
      description: 'Callback fired when tags change',
      action: 'onChange',
    },
    placeholder: {
      description: 'Placeholder text for the input field',
      control: 'text',
    },
    maxTags: {
      description: 'Maximum number of tags allowed',
      control: { type: 'number', min: 1, max: 20 },
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TagInput>;

/**
 * Default TagInput with no initial tags.
 * Users can type tags and press Enter or click Add to create them.
 */
const DefaultComponent = (args: StoryObj<typeof TagInput>['args']) => {
  const [tags, setTags] = useState<string[]>([]);
  return <TagInput {...args} tags={tags} onChange={setTags} />;
};

export const Default: Story = {
  render: DefaultComponent,
  args: {
    placeholder: 'Add a tag...',
    maxTags: 10,
  },
};

/**
 * TagInput with some initial tags already added.
 */
const WithInitialTagsComponent = (args: StoryObj<typeof TagInput>['args']) => {
  const [tags, setTags] = useState<string[]>(['react', 'typescript', 'ui']);
  return <TagInput {...args} tags={tags} onChange={setTags} />;
};

export const WithInitialTags: Story = {
  render: WithInitialTagsComponent,
  args: {
    placeholder: 'Add more tags...',
    maxTags: 10,
  },
};

/**
 * TagInput with a custom placeholder.
 */
const CustomPlaceholderComponent = (
  args: StoryObj<typeof TagInput>['args']
) => {
  const [tags, setTags] = useState<string[]>([]);
  return <TagInput {...args} tags={tags} onChange={setTags} />;
};

export const CustomPlaceholder: Story = {
  render: CustomPlaceholderComponent,
  args: {
    placeholder: 'Enter skills, technologies, or interests...',
    maxTags: 10,
  },
};

/**
 * TagInput with a limited number of tags (3 maximum).
 * Shows how the component behaves when the limit is reached.
 */
const LimitedTagsComponent = (args: StoryObj<typeof TagInput>['args']) => {
  const [tags, setTags] = useState<string[]>(['tag1', 'tag2']);
  return <TagInput {...args} tags={tags} onChange={setTags} />;
};

export const LimitedTags: Story = {
  render: LimitedTagsComponent,
  args: {
    placeholder: 'Only 1 more tag allowed...',
    maxTags: 3,
  },
};

/**
 * TagInput that has reached its maximum tag limit.
 * Input and Add button should be disabled.
 */
const MaxTagsReachedComponent = (args: StoryObj<typeof TagInput>['args']) => {
  const [tags, setTags] = useState<string[]>(['tag1', 'tag2', 'tag3']);
  return <TagInput {...args} tags={tags} onChange={setTags} />;
};

export const MaxTagsReached: Story = {
  render: MaxTagsReachedComponent,
  args: {
    placeholder: 'Maximum tags reached',
    maxTags: 3,
  },
};

/**
 * Interactive example demonstrating all TagInput features.
 * Try adding tags with Enter key or the Add button, and remove them with the × button.
 */
const InteractiveComponent = () => {
  const [tags, setTags] = useState<string[]>(['example', 'interactive']);

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '16px' }}>Interactive Tag Input</h3>
      <TagInput
        tags={tags}
        onChange={setTags}
        placeholder="Type a tag and press Enter..."
        maxTags={8}
      />
      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        <strong>Tips:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Type a tag and press Enter or click Add</li>
          <li>Click the × button to remove tags</li>
          <li>Duplicate tags are automatically prevented</li>
          <li>Maximum of {8} tags allowed</li>
        </ul>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveComponent,
};

/**
 * Example with custom styling applied to the TagInput.
 */
const CustomStylingComponent = (args: StoryObj<typeof TagInput>['args']) => {
  const [tags, setTags] = useState<string[]>(['styled', 'custom']);
  return (
    <div style={{ maxWidth: '400px' }}>
      <TagInput
        {...args}
        tags={tags}
        onChange={setTags}
        className="custom-tag-input"
      />
      <style>{`
        .custom-tag-input {
          border: 2px solid #e74c3c;
          border-radius: 8px;
          padding: 12px;
        }
      `}</style>
    </div>
  );
};

export const CustomStyling: Story = {
  render: CustomStylingComponent,
  args: {
    placeholder: 'Custom styled input...',
    maxTags: 5,
  },
};
