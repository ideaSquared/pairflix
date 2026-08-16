import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { Spacer } from './Spacer';
import { responsiveIndicator } from './Spacer.stories.css';

// Plain demo helpers for storybook documentation
const Container = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      fontFamily: 'sans-serif',
      color: '#333',
      padding: 20,
      maxWidth: '800px',
      margin: '0 auto',
    }}
  >
    {children}
  </div>
);

const DemoBox = ({
  color,
  children,
}: {
  color?: string;
  children: ReactNode;
}) => (
  <div
    style={{
      backgroundColor: color || '#007bff',
      padding: 16,
      color: 'white',
      textAlign: 'center',
      borderRadius: 4,
    }}
  >
    {children}
  </div>
);

const ResponsiveIndicator = () => <div className={responsiveIndicator} />;

export default {
  title: 'Layout/Spacer',
  component: Spacer,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the spacer',
    },
    responsive: {
      control: 'boolean',
      description:
        'Whether the spacer should be responsive (reduce size on mobile)',
    },
    inline: {
      control: 'boolean',
      description:
        'Whether the spacer should be horizontal instead of vertical',
    },
    hideOnMobile: {
      control: 'boolean',
      description: 'Whether to hide the spacer on mobile',
    },
    mobileSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Custom size for mobile viewport',
    },
    tabletSize: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Custom size for tablet viewport',
    },
  },
} satisfies Meta<typeof Spacer>;

type Story = StoryObj<typeof Spacer>;

// Vertical spacer examples with different sizes
export const VerticalSpacers: Story = {
  render: () => (
    <Container>
      <ResponsiveIndicator />
      <DemoBox>Content Block 1</DemoBox>
      <Spacer size="xs" />
      <DemoBox>After XS Spacer</DemoBox>
      <Spacer size="sm" />
      <DemoBox>After SM Spacer</DemoBox>
      <Spacer size="md" />
      <DemoBox>After MD Spacer</DemoBox>
      <Spacer size="lg" />
      <DemoBox>After LG Spacer</DemoBox>
      <Spacer size="xl" />
      <DemoBox>After XL Spacer</DemoBox>
    </Container>
  ),
};

// Horizontal spacer examples
export const HorizontalSpacers: Story = {
  render: () => (
    <Container>
      <ResponsiveIndicator />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DemoBox>Block 1</DemoBox>
        <Spacer size="xs" inline />
        <DemoBox>Block 2</DemoBox>
        <Spacer size="sm" inline />
        <DemoBox>Block 3</DemoBox>
        <Spacer size="md" inline />
        <DemoBox>Block 4</DemoBox>
      </div>
    </Container>
  ),
};

// Responsive spacer that changes on mobile
export const ResponsiveSpacers: Story = {
  render: () => (
    <Container>
      <ResponsiveIndicator />
      <p>Resize to mobile view to see spacing changes</p>
      <DemoBox>Content Block 1</DemoBox>
      <Spacer size="xl" responsive />
      <DemoBox>Content Block 2 (after responsive XL spacer)</DemoBox>
      <Spacer size="xl" />
      <DemoBox>Content Block 3 (after non-responsive XL spacer)</DemoBox>
    </Container>
  ),
};

// Spacer with custom mobile and tablet sizes
export const CustomResponsiveSizes: Story = {
  render: () => (
    <Container>
      <ResponsiveIndicator />
      <p>Resize to see different sizes on different viewports</p>
      <DemoBox>Content Block 1</DemoBox>
      <Spacer size="xl" mobileSize="xs" tabletSize="md" />
      <DemoBox>Content Block 2</DemoBox>
      <p>This spacer uses XL on desktop, MD on tablet, and XS on mobile</p>
    </Container>
  ),
};

// Hidden on mobile example
export const HiddenOnMobile: Story = {
  render: () => (
    <Container>
      <ResponsiveIndicator />
      <p>Resize to mobile to see spacer disappear</p>
      <DemoBox>Content Block 1</DemoBox>
      <Spacer size="xl" hideOnMobile />
      <DemoBox>Content Block 2</DemoBox>
      <p>The spacer above will disappear on mobile</p>
    </Container>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    size: 'md',
    responsive: false,
    inline: false,
    hideOnMobile: false,
  },
  render: args => (
    <Container>
      <ResponsiveIndicator />
      <p>Interactive playground: adjust props in the controls below</p>
      {args.inline ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <DemoBox>Block 1</DemoBox>
          <Spacer {...args} />
          <DemoBox>Block 2</DemoBox>
        </div>
      ) : (
        <>
          <DemoBox>Block 1</DemoBox>
          <Spacer {...args} />
          <DemoBox>Block 2</DemoBox>
        </>
      )}
    </Container>
  ),
};
