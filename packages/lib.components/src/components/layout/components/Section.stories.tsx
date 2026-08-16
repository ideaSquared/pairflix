// filepath: c:\Users\thete\Desktop\localdev\pairflix\lib.components\src\components\layout\components\Section.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { Section } from './Section';
import { responsiveIndicator } from './Section.stories.css';

// Plain demo helpers for storybook documentation
const DemoContent = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontFamily: 'sans-serif',
      padding: 20,
      color: '#333',
      margin: '0 auto',
      maxWidth: '1200px',
    }}
  >
    {children}
  </div>
);

const ContentBlock = ({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) => (
  <div
    style={{
      padding: 24,
      backgroundColor: color || '#fff',
      borderRadius: 8,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 500 }}>
    {children}
  </h3>
);

const SectionDescription = ({ children }: { children: ReactNode }) => (
  <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
    {children}
  </p>
);

const ResponsiveIndicator = () => <div className={responsiveIndicator} />;

export default {
  title: 'Layout/Section',
  component: Section,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    background: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'paper',
        'card',
        'input',
        'hover',
        'highlight',
      ],
      description: 'Background color from theme',
    },
    spacing: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'none'],
      description: 'Vertical spacing (top and bottom)',
    },
    isFullWidth: {
      control: 'boolean',
      description: 'Whether the section takes full browser width',
    },
  },
} satisfies Meta<typeof Section>;

type Story = StoryObj<typeof Section>;

// Basic section
export const Default: Story = {
  args: {
    spacing: 'xl',
    children: (
      <DemoContent>
        <ContentBlock>
          <h2>Default Section</h2>
          <p>
            This is a basic section with default &quot;xl&quot; spacing and
            transparent background.
          </p>
        </ContentBlock>
      </DemoContent>
    ),
  },
};

// Spacing variations
export const SpacingVariations: Story = {
  render: () => (
    <>
      <ResponsiveIndicator />

      <Section spacing="xs" background="paper">
        <DemoContent>
          <SectionTitle>Extra Small Spacing (xs)</SectionTitle>
          <ContentBlock>
            <p>Section with xs spacing applied to top and bottom.</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section spacing="sm" background="primary">
        <DemoContent>
          <SectionTitle>Small Spacing (sm)</SectionTitle>
          <ContentBlock>
            <p>Section with sm spacing applied to top and bottom.</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section spacing="md" customBackground="#f5f5f5">
        <DemoContent>
          <SectionTitle>Medium Spacing (md)</SectionTitle>
          <ContentBlock>
            <p>Section with md spacing applied to top and bottom.</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section spacing="lg" customBackground="#eeeeee">
        <DemoContent>
          <SectionTitle>Large Spacing (lg)</SectionTitle>
          <ContentBlock>
            <p>Section with lg spacing applied to top and bottom.</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section spacing="xl" background="primary">
        <DemoContent>
          <SectionTitle>Extra Large Spacing (xl) - Default</SectionTitle>
          <ContentBlock>
            <p>Section with xl spacing applied to top and bottom (default).</p>
          </ContentBlock>
        </DemoContent>
      </Section>
    </>
  ),
};

// Background variations
export const BackgroundVariations: Story = {
  render: () => (
    <>
      <Section background="primary">
        <DemoContent>
          <SectionTitle>Primary Background</SectionTitle>
          <ContentBlock>
            <p>Section with the primary background color from theme.</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section background="paper">
        <DemoContent>
          <SectionTitle>Paper Background</SectionTitle>
          <ContentBlock>
            <p>Section with the paper background color from theme.</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section background="secondary">
        <DemoContent>
          <SectionTitle>Secondary Background</SectionTitle>
          <ContentBlock>
            <p>Section with the secondary background color from theme.</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section customBackground="#f0f8ff">
        <DemoContent>
          <SectionTitle>Custom Background</SectionTitle>
          <ContentBlock>
            <p>Section with a custom background color.</p>
          </ContentBlock>
        </DemoContent>
      </Section>
    </>
  ),
};

// Full width section
export const FullWidthSection: Story = {
  args: {
    isFullWidth: true,
    background: 'primary',
    children: (
      <DemoContent>
        <ContentBlock>
          <h2>Full Width Section</h2>
          <p>This section takes the full width of the page.</p>
        </ContentBlock>
      </DemoContent>
    ),
  },
};

// Mobile behavior
export const MobileBehavior: Story = {
  render: () => (
    <>
      <ResponsiveIndicator />

      <Section spacing="xl" background="paper">
        <DemoContent>
          <SectionTitle>Default Mobile Behavior</SectionTitle>
          <SectionDescription>
            On mobile, this section automatically reduces spacing. Resize your
            browser to see the difference.
          </SectionDescription>
          <ContentBlock>
            <p>Section with default mobile behavior (reduced spacing).</p>
          </ContentBlock>
        </DemoContent>
      </Section>

      <Section spacing="xl" noSpacingOnMobile background="primary">
        <DemoContent>
          <SectionTitle>No Spacing on Mobile</SectionTitle>
          <SectionDescription>
            On mobile, this section removes spacing completely. Resize your
            browser to see the difference.
          </SectionDescription>
          <ContentBlock>
            <p>Section with noSpacingOnMobile set to true.</p>
          </ContentBlock>
        </DemoContent>
      </Section>
    </>
  ),
};

// Responsive spacing
export const ResponsiveSpacing: Story = {
  render: () => (
    <>
      <ResponsiveIndicator />

      <Section
        spacing="md"
        background="paper"
        responsiveSpacing={{
          mobile: 'xs',
          tablet: 'md',
          desktop: 'xl',
        }}
      >
        <DemoContent>
          <SectionTitle>Responsive Spacing</SectionTitle>
          <SectionDescription>
            This section has different spacing for different devices:
            <ul>
              <li>Mobile: xs spacing</li>
              <li>Tablet: md spacing</li>
              <li>Desktop: xl spacing</li>
            </ul>
            Resize your browser to see the difference.
          </SectionDescription>
          <ContentBlock>
            <p>Section with custom responsive spacing configuration.</p>
          </ContentBlock>
        </DemoContent>
      </Section>
    </>
  ),
};

// Real-world example
export const PageLayout: Story = {
  render: () => (
    <>
      <ResponsiveIndicator />

      {/* Hero Section */}
      <Section
        isFullWidth
        spacing="xl"
        customBackground="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        noSpacingOnMobile={false}
      >
        <DemoContent>
          <div
            style={{ textAlign: 'center', color: 'white', padding: '40px 0' }}
          >
            <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              Welcome to PairFlix
            </h1>
            <p
              style={{
                fontSize: '1.25rem',
                maxWidth: '600px',
                margin: '0 auto 24px',
              }}
            >
              Find the perfect movie or show to watch with your partner, no more
              endless scrolling trying to agree on what to watch!
            </p>
            <button
              style={{
                background: 'white',
                color: '#764ba2',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>
          </div>
        </DemoContent>
      </Section>

      {/* Features Section */}
      <Section spacing="lg" background="primary">
        <DemoContent>
          <SectionTitle>How It Works</SectionTitle>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              marginTop: '32px',
            }}
          >
            <ContentBlock>
              <h3>Create Lists</h3>
              <p>Add movies and shows you&apos;re interested in watching.</p>
            </ContentBlock>
            <ContentBlock>
              <h3>Match Together</h3>
              <p>Find what you and your partner both want to watch.</p>
            </ContentBlock>
            <ContentBlock>
              <h3>Enjoy Watching</h3>
              <p>No more arguments about what to watch tonight!</p>
            </ContentBlock>
          </div>
        </DemoContent>
      </Section>

      {/* CTA Section */}
      <Section
        spacing="lg"
        background="secondary"
        responsiveSpacing={{
          mobile: 'md',
          tablet: 'lg',
          desktop: 'xl',
        }}
      >
        <DemoContent>
          <div style={{ textAlign: 'center' }}>
            <h2>Ready to Start Watching Together?</h2>
            <p style={{ marginBottom: '24px' }}>
              Join thousands of couples who have found their perfect watch list.
            </p>
            <button
              style={{
                background: '#764ba2',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Sign Up Now
            </button>
          </div>
        </DemoContent>
      </Section>
    </>
  ),
};
