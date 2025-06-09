import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React, { useState } from 'react';
import styled from 'styled-components';

import { SimpleTextarea, Textarea } from './Textarea';

const Container = styled.div`
  padding: 24px;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
`;

const SectionDescription = styled.p`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Card = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background.card};
`;

const StatusDisplay = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  font-family: monospace;
  font-size: 14px;
`;

const meta: Meta<typeof Textarea> = {
  title: 'Inputs/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A versatile textarea component with character count, auto-grow, and different size options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the textarea',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the textarea',
    },
    error: {
      control: 'boolean',
      description: 'Whether the textarea is in an error state',
      defaultValue: false,
    },
    required: {
      control: 'boolean',
      description: 'Whether the textarea is required',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
      defaultValue: false,
    },
    isFullWidth: {
      control: 'boolean',
      description:
        'Whether the textarea takes up the full width of its container',
      defaultValue: false,
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the textarea',
      defaultValue: 'medium',
    },
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Number of visible text lines',
      defaultValue: 3,
    },
    maxLength: {
      control: { type: 'number', min: 10, max: 1000 },
      description: 'Maximum length of the text',
    },
    showCharacterCount: {
      control: 'boolean',
      description: 'Whether to show character count',
      defaultValue: false,
    },
    autoGrow: {
      control: 'boolean',
      description: 'Whether the textarea should automatically grow in height',
      defaultValue: false,
    },
    value: {
      control: 'text',
      description: 'Value of the textarea',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// Basic example with default settings
export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description here',
    rows: 3,
  },
};

// Sizes demonstration
export const Sizes: Story = {
  render: () => (
    <Container>
      <SectionTitle>Textarea Sizes</SectionTitle>
      <SectionDescription>
        The Textarea component comes in three sizes to fit different content
        needs.
      </SectionDescription>

      <Grid>
        <div>
          <div style={{ marginBottom: '8px' }}>Small</div>
          <Textarea size="small" placeholder="Small textarea" rows={2} />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>Medium (default)</div>
          <Textarea placeholder="Medium textarea" rows={3} />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>Large</div>
          <Textarea size="large" placeholder="Large textarea" rows={4} />
        </div>
      </Grid>
    </Container>
  ),
};

// Character counter functionality
export const CharacterCounter: Story = {
  render: () => (
    <Container>
      <SectionTitle>Character Counter</SectionTitle>
      <SectionDescription>
        The Textarea component can display a character counter, with optional
        maximum length.
      </SectionDescription>

      <Grid>
        <div>
          <div style={{ marginBottom: '8px' }}>With counter, no limit</div>
          <Textarea placeholder="Type something..." showCharacterCount />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>With counter and limit</div>
          <Textarea
            placeholder="Limited to 100 characters"
            showCharacterCount
            maxLength={100}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>Approaching limit</div>
          <Textarea
            placeholder="Limited to 50 characters"
            showCharacterCount
            maxLength={50}
            defaultValue="This text is approaching the character limit."
          />
        </div>
      </Grid>
    </Container>
  ),
};

// Auto-grow demonstration
export const AutoGrow: Story = {
  render: () => (
    <Container>
      <SectionTitle>Auto-Growing Textarea</SectionTitle>
      <SectionDescription>
        The Textarea can automatically grow in height as content is added.
      </SectionDescription>

      <div style={{ maxWidth: '500px' }}>
        <Textarea
          label="Auto-growing textarea"
          placeholder="Type multiple lines and watch me grow..."
          autoGrow
          rows={2}
        />
      </div>

      <SectionDescription style={{ marginTop: '16px' }}>
        Try typing several lines of text in the textarea above to see it grow
        automatically. This feature is useful for comment fields, notes, or any
        place where the amount of content might vary significantly.
      </SectionDescription>
    </Container>
  ),
};

// Various states
export const States: Story = {
  render: () => (
    <Container>
      <SectionTitle>Textarea States</SectionTitle>
      <SectionDescription>
        Various states of the Textarea component including error, disabled, and
        required.
      </SectionDescription>

      <Grid>
        <div>
          <div style={{ marginBottom: '8px' }}>Default</div>
          <Textarea label="Comments" placeholder="Enter comments" />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>With value</div>
          <Textarea
            label="Comments"
            defaultValue="This textarea has a default value."
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>With helper text</div>
          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            helperText="Keep it brief and engaging."
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>Error state</div>
          <Textarea
            label="Comments"
            placeholder="Enter comments"
            error={true}
            helperText="This field contains an error."
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>Required</div>
          <Textarea
            label="Feedback"
            placeholder="Your feedback is required"
            required
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>Disabled</div>
          <Textarea
            label="Disabled textarea"
            placeholder="Cannot be edited"
            disabled
          />
        </div>
      </Grid>
    </Container>
  ),
};

// Width variants
export const WidthVariants: Story = {
  render: () => (
    <Container>
      <SectionTitle>Width Variants</SectionTitle>
      <SectionDescription>
        The Textarea component can be displayed with default width or full
        width.
      </SectionDescription>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px' }}>Default width</div>
        <Textarea label="Standard width" placeholder="Default width textarea" />
      </div>

      <div>
        <div style={{ marginBottom: '8px' }}>Full width</div>
        <Textarea
          label="Full width"
          placeholder="This textarea takes up the full width of its container"
          isFullWidth
        />
      </div>
    </Container>
  ),
};

// Component wrapper for interactive demo
const InteractiveDemo: React.FC = () => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <Container>
      <SectionTitle>Interactive Example</SectionTitle>
      <SectionDescription>
        This example demonstrates a controlled Textarea component with real-time
        character counting and validation.
      </SectionDescription>

      <div style={{ maxWidth: '600px' }}>
        <Textarea
          label="Movie Review"
          placeholder="Share your thoughts on the latest movie you watched..."
          value={value}
          onChange={handleChange}
          showCharacterCount
          maxLength={500}
          autoGrow
          helperText={
            value.length === 0
              ? 'Please write your review'
              : value.length < 50
                ? 'Your review is too short (minimum 50 characters)'
                : 'Great! Your review looks good'
          }
          error={value.length > 0 && value.length < 50}
        />

        <StatusDisplay>
          <div>
            <strong>Current status:</strong>
          </div>
          <div>
            {value.length === 0
              ? 'Empty review'
              : value.length < 50
                ? `Need ${50 - value.length} more characters`
                : 'Valid review'}
          </div>
        </StatusDisplay>
      </div>
    </Container>
  );
};

// Interactive example
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

// SimpleTextarea examples
export const SimpleVariant: Story = {
  render: () => (
    <Container>
      <SectionTitle>Simple Textarea Variant</SectionTitle>
      <SectionDescription>
        The SimpleTextarea component offers the same styling without labels,
        error handling, or character counting.
      </SectionDescription>

      <Grid>
        <div>
          <div style={{ marginBottom: '8px' }}>Default SimpleTextarea</div>
          <SimpleTextarea
            placeholder="Simple textarea without extra features"
            rows={3}
          />
        </div>

        <div>
          <div style={{ marginBottom: '8px' }}>With error styling</div>
          <SimpleTextarea
            placeholder="Simple textarea with error state"
            rows={3}
            error
          />
        </div>
      </Grid>

      <div style={{ marginTop: '24px' }}>
        <div style={{ marginBottom: '8px' }}>Full width SimpleTextarea</div>
        <SimpleTextarea
          placeholder="Simple textarea with full width"
          rows={3}
          isFullWidth
        />
      </div>
    </Container>
  ),
};

// Component wrapper for form integration demo
const FormIntegrationDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    movieTitle: '',
    review: '',
    recommendation: '',
  });

  const [errors, setErrors] = useState({
    movieTitle: false,
    review: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });

      if (submitted) {
        validateField(field, e.target.value);
      }
    };

  const validateField = (field: keyof typeof formData, value: string) => {
    if (field === 'movieTitle') {
      setErrors(prev => ({
        ...prev,
        movieTitle: value.length < 3,
      }));
    } else if (field === 'review') {
      setErrors(prev => ({
        ...prev,
        review: value.length < 50,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate all fields
    const newErrors = {
      movieTitle: formData.movieTitle.length < 3,
      review: formData.review.length < 50,
    };

    setErrors(newErrors);

    if (!newErrors.movieTitle && !newErrors.review) {
      // Form is valid
      console.log('Form submitted:', formData);
    }
  };

  return (
    <Container>
      <SectionTitle>Form Integration Example</SectionTitle>
      <SectionDescription>
        Example of how Textarea components can be integrated within a form with
        validation.
      </SectionDescription>

      <Card>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Textarea
              label="Movie Title"
              placeholder="Enter movie title"
              value={formData.movieTitle}
              onChange={handleChange('movieTitle')}
              error={errors.movieTitle}
              helperText={
                errors.movieTitle ? 'Title must be at least 3 characters' : ''
              }
              required
              size="small"
              rows={1}
            />
          </FormGroup>

          <FormGroup>
            <Textarea
              label="Movie Review"
              placeholder="Write your review (minimum 50 characters)"
              value={formData.review}
              onChange={handleChange('review')}
              error={errors.review}
              helperText={
                errors.review ? 'Review must be at least 50 characters' : ''
              }
              required
              showCharacterCount
              maxLength={500}
              autoGrow
              rows={4}
              isFullWidth
            />
          </FormGroup>

          <FormGroup>
            <Textarea
              label="Recommendation (Optional)"
              placeholder="Who would you recommend this movie to?"
              value={formData.recommendation}
              onChange={handleChange('recommendation')}
              autoGrow
              rows={2}
              isFullWidth
            />
          </FormGroup>

          <button
            type="submit"
            style={{
              padding: '8px 16px',
              backgroundColor: '#0077cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Submit Review
          </button>
        </form>

        {submitted && (
          <StatusDisplay>
            <div>Form validation status:</div>
            <pre style={{ margin: '8px 0 0 0' }}>
              {JSON.stringify(
                {
                  isValid: !errors.movieTitle && !errors.review,
                  errors,
                },
                null,
                2
              )}
            </pre>
          </StatusDisplay>
        )}
      </Card>
    </Container>
  );
};

// Form integration example
export const FormIntegration: Story = {
  render: () => <FormIntegrationDemo />,
};

// Real-world examples
export const UseCases: Story = {
  render: () => (
    <Container>
      <SectionTitle>Common Usage Examples</SectionTitle>
      <SectionDescription>
        Examples of how the Textarea component might be used in different
        contexts within PairFlix.
      </SectionDescription>

      <Grid>
        <Card>
          <SectionTitle style={{ fontSize: '16px', marginBottom: '12px' }}>
            Movie Review
          </SectionTitle>
          <Textarea
            label="Your Review"
            placeholder="Share your thoughts on this movie..."
            showCharacterCount
            maxLength={500}
            autoGrow
            rows={3}
            isFullWidth
          />
        </Card>

        <Card>
          <SectionTitle style={{ fontSize: '16px', marginBottom: '12px' }}>
            Movie Notes
          </SectionTitle>
          <Textarea
            label="Personal Notes"
            placeholder="Add your private notes about this movie (only visible to you)"
            autoGrow
            rows={2}
            isFullWidth
          />
        </Card>
      </Grid>

      <Card>
        <SectionTitle style={{ fontSize: '16px', marginBottom: '12px' }}>
          Support Request
        </SectionTitle>
        <div style={{ marginBottom: '16px' }}>
          <Textarea
            label="Issue Description"
            placeholder="Please describe the issue you're experiencing..."
            required
            showCharacterCount
            maxLength={1000}
            autoGrow
            rows={4}
            isFullWidth
          />
        </div>

        <div>
          <Textarea
            label="Steps to Reproduce (Optional)"
            placeholder="Help us reproduce the issue by providing step-by-step instructions..."
            autoGrow
            rows={3}
            isFullWidth
          />
        </div>
      </Card>
    </Container>
  ),
};

// Accessibility features
export const Accessibility: Story = {
  render: () => (
    <Container>
      <SectionTitle>Accessibility Features</SectionTitle>
      <SectionDescription>
        The Textarea component is built with accessibility in mind, supporting
        ARIA attributes, proper labeling, and keyboard navigation.
      </SectionDescription>

      <Card>
        <div style={{ marginBottom: '24px' }}>
          <SectionTitle style={{ fontSize: '16px' }}>
            Proper Labeling
          </SectionTitle>
          <SectionDescription>
            The Textarea uses explicit labels that are properly associated with
            the form control.
          </SectionDescription>

          <Textarea
            id="explicitly-labeled-textarea"
            label="Explicitly Labeled Textarea"
            placeholder="This textarea has a proper label association"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <SectionTitle style={{ fontSize: '16px' }}>
            Error Identification
          </SectionTitle>
          <SectionDescription>
            Errors are clearly identified both visually and programmatically.
          </SectionDescription>

          <Textarea
            label="With Error State"
            placeholder="This field has an error"
            error={true}
            helperText="This is an error message that is linked to the textarea via aria-describedby"
          />
        </div>

        <div>
          <SectionTitle style={{ fontSize: '16px' }}>
            Required Fields
          </SectionTitle>
          <SectionDescription>
            Required fields are clearly marked both visually and with
            aria-required.
          </SectionDescription>

          <Textarea
            label="Required Field"
            placeholder="This field is required"
            required
          />
        </div>
      </Card>
    </Container>
  ),
};
