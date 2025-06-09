import type { Meta, StoryObj } from '@storybook/react-webpack5';
import styled from 'styled-components';

import { Card } from '../../data-display/Card';
import { Button } from '../../inputs/Button';
import {
  ButtonLoading,
  InlineLoading,
  Loading,
  LoadingSpinner,
} from './Loading';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 16px;
  max-width: 800px;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
`;

const CardWrapper = styled.div`
  width: 250px;
`;

const CenteredCard = styled(Card)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
`;

const DemoSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin-bottom: 16px;
  font-size: 18px;
`;

const FullHeightContainer = styled.div`
  height: 400px;
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const meta: Meta<typeof Loading> = {
  title: 'Feedback/Loading',
  component: Loading,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Loading components for displaying various loading states in the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'number', min: 16, max: 100, step: 4 },
      description: 'Size of the spinner in pixels',
      defaultValue: 40,
    },
    message: {
      control: 'text',
      description: 'Loading message to display',
      defaultValue: 'Loading...',
    },
    fullScreen: {
      control: 'boolean',
      description: 'Whether to show in fullscreen mode',
      defaultValue: false,
    },
    spinnerProps: {
      control: 'object',
      description: 'Props to pass to the spinner component',
    },
    children: {
      control: 'text',
      description: 'Additional content to render below the spinner',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Loading>;

// Basic Loading
export const Default: Story = {
  args: {
    size: 40,
    message: 'Loading...',
  },
};

// Loading with custom message
export const CustomMessage: Story = {
  args: {
    size: 40,
    message: 'Fetching user data...',
  },
};

// Loading with additional content
export const WithAdditionalContent: Story = {
  args: {
    size: 48,
    message: 'Processing your request',
    children: (
      <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
        This may take a few moments
      </div>
    ),
  },
};

// Spinners in different sizes
export const SpinnerSizes: Story = {
  render: () => (
    <Container>
      <SectionTitle>Spinner Sizes</SectionTitle>
      <Row>
        <div>
          <p>Small (24px)</p>
          <LoadingSpinner size={24} />
        </div>
        <div>
          <p>Medium (40px)</p>
          <LoadingSpinner size={40} />
        </div>
        <div>
          <p>Large (64px)</p>
          <LoadingSpinner size={64} />
        </div>
        <div>
          <p>Extra Large (96px)</p>
          <LoadingSpinner size={96} />
        </div>
      </Row>
    </Container>
  ),
};

// Spinner with different thickness
export const SpinnerThickness: Story = {
  render: () => (
    <Container>
      <SectionTitle>Spinner Thickness</SectionTitle>
      <Row>
        <div>
          <p>Thin (2px)</p>
          <LoadingSpinner size={40} thickness={2} />
        </div>
        <div>
          <p>Medium (4px)</p>
          <LoadingSpinner size={40} thickness={4} />
        </div>
        <div>
          <p>Thick (6px)</p>
          <LoadingSpinner size={40} thickness={6} />
        </div>
        <div>
          <p>Extra Thick (8px)</p>
          <LoadingSpinner size={40} thickness={8} />
        </div>
      </Row>
    </Container>
  ),
};

// Spinner with different colors
export const SpinnerColors: Story = {
  render: () => (
    <Container>
      <SectionTitle>Spinner Colors</SectionTitle>
      <Row>
        <div>
          <p>Default (Theme Primary)</p>
          <LoadingSpinner size={40} />
        </div>
        <div>
          <p>Blue</p>
          <LoadingSpinner size={40} color="#2196F3" />
        </div>
        <div>
          <p>Green</p>
          <LoadingSpinner size={40} color="#4CAF50" />
        </div>
        <div>
          <p>Purple</p>
          <LoadingSpinner size={40} color="#9C27B0" />
        </div>
        <div>
          <p>Red</p>
          <LoadingSpinner size={40} color="#F44336" />
        </div>
      </Row>

      <SectionTitle>With Custom Track Colors</SectionTitle>
      <Row>
        <div>
          <p>Default Track</p>
          <LoadingSpinner size={40} color="#2196F3" />
        </div>
        <div>
          <p>Light Gray Track</p>
          <LoadingSpinner size={40} color="#2196F3" trackColor="#e0e0e0" />
        </div>
        <div>
          <p>Light Blue Track</p>
          <LoadingSpinner size={40} color="#2196F3" trackColor="#bbdefb" />
        </div>
        <div>
          <p>Custom Track</p>
          <LoadingSpinner size={40} color="#9C27B0" trackColor="#f3e5f5" />
        </div>
      </Row>
    </Container>
  ),
};

// Spinner speed variations
export const SpinnerSpeed: Story = {
  render: () => (
    <Container>
      <SectionTitle>Spinner Animation Speed</SectionTitle>
      <Row>
        <div>
          <p>Fast (0.5s)</p>
          <LoadingSpinner size={40} speed={0.5} />
        </div>
        <div>
          <p>Normal (1s)</p>
          <LoadingSpinner size={40} speed={1} />
        </div>
        <div>
          <p>Slow (2s)</p>
          <LoadingSpinner size={40} speed={2} />
        </div>
        <div>
          <p>Very Slow (3s)</p>
          <LoadingSpinner size={40} speed={3} />
        </div>
      </Row>
    </Container>
  ),
};

// Inline Loading
export const InlineLoadingVariants: Story = {
  render: () => (
    <Container>
      <SectionTitle>Inline Loading Examples</SectionTitle>

      <DemoSection>
        <p>
          Default inline loading: <InlineLoading />
        </p>
      </DemoSection>

      <DemoSection>
        <p>
          With custom message: <InlineLoading message="Searching..." />
        </p>
      </DemoSection>

      <DemoSection>
        <p>
          Small size: <InlineLoading size={16} message="Fetching data..." />
        </p>
      </DemoSection>

      <DemoSection>
        <p>
          Custom color:{' '}
          <InlineLoading color="#E91E63" message="Processing..." />
        </p>
      </DemoSection>

      <DemoSection>
        <p style={{ display: 'flex', alignItems: 'center' }}>
          Within text content. Please wait while we{' '}
          <InlineLoading size={16} message="load your preferences" /> for this
          section.
        </p>
      </DemoSection>
    </Container>
  ),
};

// Button Loading
export const LoadingButtons: Story = {
  render: () => (
    <Container>
      <SectionTitle>Button Loading Examples</SectionTitle>

      <Row>
        <Button>
          <ButtonLoading />
          <span style={{ marginLeft: '8px' }}>Loading...</span>
        </Button>

        <Button variant="secondary">
          <ButtonLoading color="#666" />
          <span style={{ marginLeft: '8px' }}>Submitting</span>
        </Button>

        <Button variant="success">
          <ButtonLoading />
          <span style={{ marginLeft: '8px' }}>Processing</span>
        </Button>

        <Button variant="danger">
          <ButtonLoading />
          <span style={{ marginLeft: '8px' }}>Deleting</span>
        </Button>
      </Row>

      <Row>
        <Button size="small">
          <ButtonLoading size={14} />
          <span style={{ marginLeft: '8px' }}>Small</span>
        </Button>

        <Button>
          <ButtonLoading size={16} />
          <span style={{ marginLeft: '8px' }}>Medium</span>
        </Button>

        <Button size="large">
          <ButtonLoading size={20} />
          <span style={{ marginLeft: '8px' }}>Large</span>
        </Button>
      </Row>

      <Row>
        <Button disabled>
          <ButtonLoading />
          <span style={{ marginLeft: '8px' }}>Disabled</span>
        </Button>
      </Row>
    </Container>
  ),
};

// Loading in cards
export const LoadingInContexts: Story = {
  render: () => (
    <Container>
      <SectionTitle>Loading in Different Contexts</SectionTitle>

      <Row>
        <CardWrapper>
          <CenteredCard>
            <Loading size={32} message="Loading card content" />
          </CenteredCard>
        </CardWrapper>

        <CardWrapper>
          <CenteredCard>
            <Loading
              size={32}
              message="Fetching data"
              spinnerProps={{ color: '#9C27B0', speed: 1.5 }}
            />
          </CenteredCard>
        </CardWrapper>

        <CardWrapper>
          <Card>
            <h4>Movie Details</h4>
            <p>
              Director: <InlineLoading size={16} message="Loading" />
            </p>
            <p>
              Release date: <InlineLoading size={16} message="Loading" />
            </p>
            <p>
              Runtime: <InlineLoading size={16} message="Loading" />
            </p>
          </Card>
        </CardWrapper>
      </Row>
    </Container>
  ),
};

// Loading in container
export const LoadingInContainer: Story = {
  render: () => (
    <Container>
      <SectionTitle>Loading in Container</SectionTitle>

      <FullHeightContainer>
        <Loading
          size={48}
          message="Loading content"
          children={
            <div
              style={{
                marginTop: '16px',
                fontSize: '14px',
                color: '#666',
                textAlign: 'center',
              }}
            >
              Please wait while we fetch your data.
              <br />
              This may take a few moments.
            </div>
          }
        />
      </FullHeightContainer>
    </Container>
  ),
};

// Fullscreen loading (note: this will only be visible in Canvas view, not in Docs)
export const FullScreenLoading: Story = {
  args: {
    size: 64,
    message: 'Loading application...',
    fullScreen: true,
  },
};
