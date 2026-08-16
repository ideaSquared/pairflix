import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { Container } from './Container';
import { Flex } from './Flex';
import {
  containerBgInner,
  containerBgInnermost,
  containerBgLight,
  containerBgOuter,
  containerMarginTop,
  contentBlock,
  contentBlockFormPadding,
  contentBlockSidebarContent,
  contentBlockTallContent,
  sectionTitle,
} from './Container.stories.css';

// Plain demo helpers for storybook documentation
const DemoContent = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: 'sans-serif', padding: 20, color: '#333' }}>
    {children}
  </div>
);

const SectionTitle = ({
  children,
  small,
}: {
  children: ReactNode;
  small?: boolean;
}) => <h3 className={sectionTitle({ small })}>{children}</h3>;

const SectionDescription = ({ children }: { children: ReactNode }) => (
  <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
    {children}
  </p>
);

// Content block to show container boundaries
const ContentBlock = ({
  bgColor,
  className = contentBlock,
  children,
}: {
  bgColor?: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={className} style={{ backgroundColor: bgColor || '#f5f5f5' }}>
    {children}
  </div>
);

// Container visualization helper
const ContainerVisualization = ({
  dark,
  children,
}: {
  dark?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      width: '100%',
      backgroundColor: dark ? '#f0f0f0' : '#ffffff',
      border: '1px dashed #ccc',
      padding: 24,
      borderRadius: 8,
      marginBottom: 24,
      position: 'relative',
    }}
  >
    {children}
  </div>
);

const ContainerLabel = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      top: -10,
      left: 16,
      backgroundColor: '#ffffff',
      padding: '0 8px',
      fontSize: 12,
      color: '#666',
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

// Width indicator to show container dimensions
const WidthIndicator = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      color: '#666',
      padding: '4px 8px',
      borderRadius: 4,
      fontSize: 12,
      fontFamily: 'monospace',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A layout container component that provides consistent width constraints, padding, and responsive behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl', 'none'],
      description: 'Maximum width constraint based on theme breakpoints',
      table: {
        defaultValue: { summary: 'lg' },
      },
    },
    padding: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Container padding from theme spacing',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    fluid: {
      control: 'boolean',
      description: 'Whether container should be fluid width (no max-width)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    centered: {
      control: 'boolean',
      description: 'Whether container should be horizontally centered',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    isFullWidth: {
      control: 'boolean',
      description: 'Whether container should take full width of parent',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    width: {
      control: 'text',
      description: 'Custom width override',
    },
    minWidth: {
      control: 'text',
      description: 'Custom min-width',
    },
    customMaxWidth: {
      control: 'text',
      description: 'Custom max-width override',
    },
    noPaddingOnMobile: {
      control: 'boolean',
      description: 'Whether to disable padding on mobile screens',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    responsivePadding: {
      control: 'object',
      description: 'Custom padding values for different breakpoints',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

// Basic Container
export const Basic: Story = {
  args: {
    children: (
      <ContentBlock>
        <h3>Default Container</h3>
        <p>
          A basic container with default settings (lg maxWidth and md padding)
        </p>
      </ContentBlock>
    ),
  },
};

// Max Width Variations
export const MaxWidthVariations: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Maximum Width Variations</SectionTitle>
      <SectionDescription>
        Demonstration of different maxWidth options. Resize the browser to see
        responsive behavior.
      </SectionDescription>

      <ContainerVisualization dark>
        <ContainerLabel>maxWidth=&quot;sm&quot; (600px)</ContainerLabel>
        <Container maxWidth="sm">
          <ContentBlock>
            <h4>Small Container (sm)</h4>
            <p>Maximum width: 600px</p>
            <WidthIndicator>max-width: 600px</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>maxWidth=&quot;md&quot; (960px)</ContainerLabel>
        <Container maxWidth="md">
          <ContentBlock>
            <h4>Medium Container (md)</h4>
            <p>Maximum width: 960px</p>
            <WidthIndicator>max-width: 960px</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>
          maxWidth=&quot;lg&quot; (1280px) - Default
        </ContainerLabel>
        <Container maxWidth="lg">
          <ContentBlock>
            <h4>Large Container (lg)</h4>
            <p>Maximum width: 1280px - This is the default</p>
            <WidthIndicator>max-width: 1280px</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>maxWidth=&quot;xl&quot; (1920px)</ContainerLabel>
        <Container maxWidth="xl">
          <ContentBlock>
            <h4>Extra Large Container (xl)</h4>
            <p>Maximum width: 1920px</p>
            <WidthIndicator>max-width: 1920px</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>
          maxWidth=&quot;none&quot; (or fluid=true)
        </ContainerLabel>
        <Container maxWidth="none">
          <ContentBlock>
            <h4>No Max Width / Fluid Container</h4>
            <p>Takes up full available width</p>
            <WidthIndicator>max-width: none</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};

// Padding Variations
export const PaddingVariations: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Padding Variations</SectionTitle>
      <SectionDescription>
        Demonstration of different padding options using theme spacing.
      </SectionDescription>

      <ContainerVisualization>
        <ContainerLabel>padding=&quot;xs&quot; (0.25rem)</ContainerLabel>
        <Container padding="xs" className={containerBgLight}>
          <ContentBlock bgColor="#ffffff">
            <p>Extra Small Padding (xs)</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization>
        <ContainerLabel>padding=&quot;sm&quot; (0.5rem)</ContainerLabel>
        <Container padding="sm" className={containerBgLight}>
          <ContentBlock bgColor="#ffffff">
            <p>Small Padding (sm)</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization>
        <ContainerLabel>padding=&quot;md&quot; (1rem) - Default</ContainerLabel>
        <Container padding="md" className={containerBgLight}>
          <ContentBlock bgColor="#ffffff">
            <p>Medium Padding (md) - Default</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization>
        <ContainerLabel>padding=&quot;lg&quot; (1.5rem)</ContainerLabel>
        <Container padding="lg" className={containerBgLight}>
          <ContentBlock bgColor="#ffffff">
            <p>Large Padding (lg)</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization>
        <ContainerLabel>padding=&quot;xl&quot; (2rem)</ContainerLabel>
        <Container padding="xl" className={containerBgLight}>
          <ContentBlock bgColor="#ffffff">
            <p>Extra Large Padding (xl)</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};

// Fluid Container
export const FluidContainer: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Fluid vs. Fixed Width Containers</SectionTitle>
      <SectionDescription>
        Demonstration of fluid containers without max-width constraints.
      </SectionDescription>

      <ContainerVisualization dark>
        <ContainerLabel>Fixed Width (Default)</ContainerLabel>
        <Container>
          <ContentBlock>
            <h4>Fixed Width Container</h4>
            <p>Has a max-width constraint based on maxWidth prop</p>
            <WidthIndicator>max-width: 1280px (lg)</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>Fluid Container (fluid=true)</ContainerLabel>
        <Container fluid>
          <ContentBlock>
            <h4>Fluid Container</h4>
            <p>No max-width constraint, takes up full available width</p>
            <WidthIndicator>max-width: none</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};

// Centering Options
export const CenteringOptions: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Centering Options</SectionTitle>
      <SectionDescription>
        Demonstration of centered vs. non-centered containers.
      </SectionDescription>

      <ContainerVisualization dark>
        <ContainerLabel>Centered Container (Default)</ContainerLabel>
        <Container maxWidth="md">
          <ContentBlock>
            <h4>Centered Container</h4>
            <p>Container is horizontally centered with auto margins</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>Non-Centered Container (centered=false)</ContainerLabel>
        <Container maxWidth="md" centered={false}>
          <ContentBlock>
            <h4>Non-Centered Container</h4>
            <p>Container aligns to the left side</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};

// Full Width
export const FullWidthContainer: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Full Width Container</SectionTitle>
      <SectionDescription>
        Using isFullWidth prop to take 100% width of parent.
      </SectionDescription>

      <ContainerVisualization dark>
        <ContainerLabel>Regular Container</ContainerLabel>
        <Container maxWidth="md">
          <ContentBlock>
            <h4>Regular Container</h4>
            <p>Has auto width and respects max-width</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>Full Width Container (isFullWidth=true)</ContainerLabel>
        <Container maxWidth="md" isFullWidth>
          <ContentBlock>
            <h4>Full Width Container</h4>
            <p>Has width: 100% while still respecting max-width</p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};

// Custom Width Options
export const CustomWidthOptions: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Custom Width Options</SectionTitle>
      <SectionDescription>
        Using custom width, minWidth, and customMaxWidth props.
      </SectionDescription>

      <ContainerVisualization dark>
        <ContainerLabel>Custom Width (width=&quot;70%&quot;)</ContainerLabel>
        <Container width="70%">
          <ContentBlock>
            <h4>Custom Width Container</h4>
            <p>Uses a specific width (70%)</p>
            <WidthIndicator>width: 70%</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>
          Custom Min Width (minWidth=&quot;400px&quot;)
        </ContainerLabel>
        <Container minWidth="400px" maxWidth="md">
          <ContentBlock>
            <h4>Container with Min Width</h4>
            <p>Will not shrink below 400px</p>
            <WidthIndicator>min-width: 400px</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization dark>
        <ContainerLabel>
          Custom Max Width (customMaxWidth=&quot;800px&quot;)
        </ContainerLabel>
        <Container customMaxWidth="800px">
          <ContentBlock>
            <h4>Custom Max Width Container</h4>
            <p>Uses a custom max-width value (800px)</p>
            <WidthIndicator>max-width: 800px</WidthIndicator>
          </ContentBlock>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};

// Responsive Padding
export const ResponsivePadding: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Responsive Padding</SectionTitle>
      <SectionDescription>
        Demonstration of responsive padding options and noPaddingOnMobile.
      </SectionDescription>

      <ContainerVisualization>
        <ContainerLabel>Default Responsive Padding</ContainerLabel>
        <Container className={containerBgLight}>
          <ContentBlock bgColor="#ffffff">
            <h4>Default Padding Behavior</h4>
            <p>
              Maintains consistent padding on all devices, automatically reduces
              larger paddings on mobile
            </p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization>
        <ContainerLabel>No Padding on Mobile</ContainerLabel>
        <Container noPaddingOnMobile className={containerBgLight}>
          <ContentBlock bgColor="#ffffff">
            <h4>No Padding on Mobile</h4>
            <p>
              Removes padding completely on mobile devices (resize to see
              effect)
            </p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <ContainerVisualization>
        <ContainerLabel>Custom Responsive Padding</ContainerLabel>
        <Container
          responsivePadding={{
            mobile: 'xs',
            tablet: 'md',
            desktop: 'xl',
          }}
          className={containerBgLight}
        >
          <ContentBlock bgColor="#ffffff">
            <h4>Custom Responsive Padding</h4>
            <p>
              Uses different padding values at different breakpoints (xs on
              mobile, md on tablet, xl on desktop)
            </p>
          </ContentBlock>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};

// Common Use Cases
export const CommonUseCases: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Common Use Cases</SectionTitle>
      <SectionDescription>
        Examples of common container usage patterns in applications.
      </SectionDescription>

      <SectionTitle small>Page Layout</SectionTitle>
      <ContainerVisualization dark>
        <Container>
          <Flex direction="column" gap="md">
            <ContentBlock bgColor="#e1f5fe">
              <h3>Page Header</h3>
              <p>Typically contains navigation, logo, user menu</p>
            </ContentBlock>
            <ContentBlock bgColor="#e8f5e9" className={contentBlockTallContent}>
              <h3>Page Content</h3>
              <p>
                Main content area with contained width for better readability
              </p>
            </ContentBlock>
            <ContentBlock bgColor="#fff3e0">
              <h3>Page Footer</h3>
              <p>Contains links, copyright information, etc.</p>
            </ContentBlock>
          </Flex>
        </Container>
      </ContainerVisualization>

      <SectionTitle small>Form Container</SectionTitle>
      <ContainerVisualization dark>
        <Container maxWidth="sm" padding="lg">
          <ContentBlock bgColor="#f9f9f9" className={contentBlockFormPadding}>
            <h3 style={{ marginTop: 0 }}>Sign In</h3>
            <Flex direction="column" gap="md" isFullWidth>
              <Flex direction="column" gap="xs">
                <label htmlFor="login-email" style={{ fontWeight: 500 }}>
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '100%',
                  }}
                />
              </Flex>
              <Flex direction="column" gap="xs">
                <label htmlFor="login-password" style={{ fontWeight: 500 }}>
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '100%',
                  }}
                />
              </Flex>
              <button
                style={{
                  padding: '10px',
                  backgroundColor: '#3f51b5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '8px',
                }}
              >
                Sign In
              </button>
            </Flex>
          </ContentBlock>
        </Container>
      </ContainerVisualization>

      <SectionTitle small>Content with Sidebar</SectionTitle>
      <ContainerVisualization dark>
        <Container>
          <Flex gap="md">
            <Flex direction="column" gap="md" flex="0 0 250px">
              <ContentBlock bgColor="#e3f2fd">
                <h4>Sidebar</h4>
                <p>Navigation or filters</p>
              </ContentBlock>
            </Flex>
            <Flex direction="column" gap="md" flex="1">
              <ContentBlock
                bgColor="#f5f5f5"
                className={contentBlockSidebarContent}
              >
                <h4>Main Content</h4>
                <p>Page content with constrained width</p>
              </ContentBlock>
            </Flex>
          </Flex>
        </Container>
      </ContainerVisualization>

      <SectionTitle small>
        Full Width Header with Contained Content
      </SectionTitle>
      <div style={{ backgroundColor: '#3f51b5', padding: '24px 0' }}>
        <Container>
          <h2 style={{ color: 'white', margin: 0 }}>Full Width Hero Section</h2>
          <p style={{ color: 'white', opacity: 0.9 }}>
            With contained content for better readability
          </p>
        </Container>
      </div>
      <Container className={containerMarginTop}>
        <ContentBlock>
          <h3>Contained Content Area</h3>
          <p>Following a full-width colored section</p>
        </ContentBlock>
      </Container>
    </DemoContent>
  ),
};

// Nested Containers
export const NestedContainers: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Nested Containers</SectionTitle>
      <SectionDescription>
        Demonstration of containers nested within containers.
      </SectionDescription>

      <ContainerVisualization dark>
        <ContainerLabel>
          Outer Container (maxWidth=&quot;lg&quot;)
        </ContainerLabel>
        <Container maxWidth="lg" padding="lg" className={containerBgOuter}>
          <h3>Outer Container</h3>
          <p style={{ marginBottom: '16px' }}>
            This is the outer container with maxWidth=&quot;lg&quot;
          </p>

          <ContainerVisualization>
            <ContainerLabel>
              Inner Container (maxWidth=&quot;md&quot;)
            </ContainerLabel>
            <Container maxWidth="md" padding="md" className={containerBgInner}>
              <h4>Inner Container</h4>
              <p style={{ marginBottom: '16px' }}>
                This is an inner container with maxWidth=&quot;md&quot;
              </p>

              <ContainerVisualization>
                <ContainerLabel>
                  Innermost Container (maxWidth=&quot;sm&quot;)
                </ContainerLabel>
                <Container
                  maxWidth="sm"
                  padding="md"
                  className={containerBgInnermost}
                >
                  <ContentBlock>
                    <h5>Innermost Container</h5>
                    <p>
                      This is the innermost container with
                      maxWidth=&quot;sm&quot;
                    </p>
                  </ContentBlock>
                </Container>
              </ContainerVisualization>
            </Container>
          </ContainerVisualization>
        </Container>
      </ContainerVisualization>
    </DemoContent>
  ),
};
