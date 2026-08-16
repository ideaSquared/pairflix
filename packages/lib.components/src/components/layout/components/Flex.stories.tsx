import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

import { Flex } from './Flex';
import {
  cardLayoutWrapper,
  centeredContentWrapper,
  formLayoutWrapper,
  sectionTitle,
} from './Flex.stories.css';

// Plain demo helpers for storybook documentation
const DemoItem = ({
  color,
  width,
  height,
  fontSize,
  flexShrink,
  children,
}: {
  color?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  flexShrink?: number;
  children: ReactNode;
}) => (
  <div
    style={{
      padding: 16,
      backgroundColor: color || '#3f51b5',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
      fontSize: fontSize || 14,
      borderRadius: 4,
      ...(width && { width }),
      ...(height && { height }),
      ...(flexShrink !== undefined && { flexShrink }),
    }}
  >
    {children}
  </div>
);

const DemoContent = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: 'sans-serif', padding: 20, color: '#333' }}>
    {children}
  </div>
);

const SectionTitle = ({
  children,
  small,
  spaced,
}: {
  children: ReactNode;
  small?: boolean;
  spaced?: boolean;
}) => <h3 className={sectionTitle({ small, spaced })}>{children}</h3>;

const SectionDescription = ({ children }: { children: ReactNode }) => (
  <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: 14 }}>
    {children}
  </p>
);

// Nav "links" in this demo don't navigate anywhere, so they're buttons
// styled to look like links rather than anchors with a placeholder href.
const linkButtonStyle = {
  color: '#3f51b5',
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  cursor: 'pointer',
};

const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A flexible layout component with responsive behavior and comprehensive flexbox capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Flexbox specific props
    inline: {
      control: 'boolean',
      description: 'Sets display to inline-flex instead of flex',
    },
    direction: {
      control: 'select',
      options: ['row', 'column'],
      description: 'Sets flex-direction property',
    },
    reverse: {
      control: 'boolean',
      description:
        'Reverses the direction (row → row-reverse, column → column-reverse)',
    },
    wrap: {
      control: 'select',
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Sets flex-wrap property',
    },
    justifyContent: {
      control: 'select',
      options: [
        'start',
        'end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
        'flex-start',
        'flex-end',
      ],
      description: 'Sets justify-content property',
    },
    alignItems: {
      control: 'select',
      options: [
        'start',
        'end',
        'center',
        'baseline',
        'stretch',
        'flex-start',
        'flex-end',
      ],
      description: 'Sets align-items property',
    },
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Sets gap between flex items using theme spacing',
    },
    isFullWidth: {
      control: 'boolean',
      description: 'Makes the container take full width',
    },
    fullHeight: {
      control: 'boolean',
      description: 'Makes the container take full height',
    },
    center: {
      control: 'boolean',
      description: 'Centers items both horizontally and vertically',
    },
    // Responsive props
    mobileDirection: {
      control: 'select',
      options: ['row', 'column'],
      description: 'Flex direction on mobile devices',
    },
    tabletDirection: {
      control: 'select',
      options: ['row', 'column'],
      description: 'Flex direction on tablet devices',
    },
    mobileGap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between items on mobile devices',
    },
    // Other props
    flex: {
      control: 'text',
      description: 'CSS flex property',
    },
    grow: {
      control: 'number',
      description: 'CSS flex-grow property',
    },
    shrink: {
      control: 'number',
      description: 'CSS flex-shrink property',
    },
    basis: {
      control: 'text',
      description: 'CSS flex-basis property',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Flex>;

// Basic Flex Container
export const Basic: Story = {
  args: {
    gap: 'md',
    children: [
      <DemoItem key="1">Item 1</DemoItem>,
      <DemoItem key="2">Item 2</DemoItem>,
      <DemoItem key="3">Item 3</DemoItem>,
    ],
  },
};

// Direction Variations
export const DirectionVariations: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Flex Direction Variations</SectionTitle>
      <SectionDescription>
        Demonstration of different flex direction options.
      </SectionDescription>

      <Flex direction="row" gap="md">
        <DemoItem width="100px">Row Item 1</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          Row Item 2
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          Row Item 3
        </DemoItem>
      </Flex>

      <Flex direction="row" reverse gap="md">
        <DemoItem width="100px">Row-Reverse 1</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          Row-Reverse 2
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          Row-Reverse 3
        </DemoItem>
      </Flex>

      <Flex direction="column" gap="sm">
        <DemoItem height="60px">Column Item 1</DemoItem>
        <DemoItem height="60px" color="#7e57c2">
          Column Item 2
        </DemoItem>
        <DemoItem height="60px" color="#5c6bc0">
          Column Item 3
        </DemoItem>
      </Flex>

      <Flex direction="column" reverse gap="sm">
        <DemoItem height="60px">Column-Reverse 1</DemoItem>
        <DemoItem height="60px" color="#7e57c2">
          Column-Reverse 2
        </DemoItem>
        <DemoItem height="60px" color="#5c6bc0">
          Column-Reverse 3
        </DemoItem>
      </Flex>
    </DemoContent>
  ),
};

// Justify Content Variations
export const JustifyContentVariations: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Justify Content Variations</SectionTitle>
      <SectionDescription>
        Demonstration of different justify-content options.
      </SectionDescription>

      <Flex justifyContent="flex-start" gap="md">
        <DemoItem width="100px">flex-start</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          flex-start
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          flex-start
        </DemoItem>
      </Flex>

      <Flex justifyContent="flex-end" gap="md">
        <DemoItem width="100px">flex-end</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          flex-end
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          flex-end
        </DemoItem>
      </Flex>

      <Flex justifyContent="center" gap="md">
        <DemoItem width="100px">center</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          center
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          center
        </DemoItem>
      </Flex>

      <Flex justifyContent="space-between">
        <DemoItem width="100px">space-between</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          space-between
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          space-between
        </DemoItem>
      </Flex>

      <Flex justifyContent="space-around">
        <DemoItem width="100px">space-around</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          space-around
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          space-around
        </DemoItem>
      </Flex>

      <Flex justifyContent="space-evenly">
        <DemoItem width="100px">space-evenly</DemoItem>
        <DemoItem width="100px" color="#7e57c2">
          space-evenly
        </DemoItem>
        <DemoItem width="100px" color="#5c6bc0">
          space-evenly
        </DemoItem>
      </Flex>
    </DemoContent>
  ),
};

// Align Items Variations
export const AlignItemsVariations: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Align Items Variations</SectionTitle>
      <SectionDescription>
        Demonstration of different align-items options.
      </SectionDescription>

      <Flex alignItems="flex-start" gap="md">
        <DemoItem width="100px" height="40px">
          flex-start
        </DemoItem>
        <DemoItem width="100px" height="60px" color="#7e57c2">
          flex-start
        </DemoItem>
        <DemoItem width="100px" height="80px" color="#5c6bc0">
          flex-start
        </DemoItem>
      </Flex>

      <Flex alignItems="flex-end" gap="md">
        <DemoItem width="100px" height="40px">
          flex-end
        </DemoItem>
        <DemoItem width="100px" height="60px" color="#7e57c2">
          flex-end
        </DemoItem>
        <DemoItem width="100px" height="80px" color="#5c6bc0">
          flex-end
        </DemoItem>
      </Flex>

      <Flex alignItems="center" gap="md">
        <DemoItem width="100px" height="40px">
          center
        </DemoItem>
        <DemoItem width="100px" height="60px" color="#7e57c2">
          center
        </DemoItem>
        <DemoItem width="100px" height="80px" color="#5c6bc0">
          center
        </DemoItem>
      </Flex>

      <Flex alignItems="baseline" gap="md">
        <DemoItem width="100px" height="40px" fontSize="12px">
          baseline
        </DemoItem>
        <DemoItem width="100px" height="60px" fontSize="18px" color="#7e57c2">
          baseline
        </DemoItem>
        <DemoItem width="100px" height="80px" fontSize="24px" color="#5c6bc0">
          baseline
        </DemoItem>
      </Flex>

      <Flex alignItems="stretch" gap="md">
        <DemoItem width="100px" height="auto">
          stretch
        </DemoItem>
        <DemoItem width="100px" height="auto" color="#7e57c2">
          stretch
        </DemoItem>
        <DemoItem width="100px" height="auto" color="#5c6bc0">
          stretch
        </DemoItem>
      </Flex>
    </DemoContent>
  ),
};

// Flex Wrap Variations
export const FlexWrapVariations: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Flex Wrap Variations</SectionTitle>
      <SectionDescription>
        Demonstration of different flex-wrap options.
      </SectionDescription>

      <Flex wrap="nowrap">
        <DemoItem width="150px" flexShrink={0}>
          nowrap
        </DemoItem>
        <DemoItem width="150px" flexShrink={0} color="#7e57c2">
          nowrap
        </DemoItem>
        <DemoItem width="150px" flexShrink={0} color="#5c6bc0">
          nowrap
        </DemoItem>
      </Flex>

      <Flex wrap="wrap" gap="sm">
        <DemoItem width="150px">wrap</DemoItem>
        <DemoItem width="150px" color="#7e57c2">
          wrap
        </DemoItem>
        <DemoItem width="150px" color="#5c6bc0">
          wrap
        </DemoItem>
        <DemoItem width="150px" color="#4caf50">
          wrap
        </DemoItem>
        <DemoItem width="150px" color="#ff9800">
          wrap
        </DemoItem>
      </Flex>

      <Flex wrap="wrap-reverse" gap="sm">
        <DemoItem width="150px">wrap-reverse</DemoItem>
        <DemoItem width="150px" color="#7e57c2">
          wrap-reverse
        </DemoItem>
        <DemoItem width="150px" color="#5c6bc0">
          wrap-reverse
        </DemoItem>
        <DemoItem width="150px" color="#4caf50">
          wrap-reverse
        </DemoItem>
        <DemoItem width="150px" color="#ff9800">
          wrap-reverse
        </DemoItem>
      </Flex>
    </DemoContent>
  ),
};

// Flex with Gap
export const FlexWithGap: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Flex with Gap</SectionTitle>
      <SectionDescription>
        Using the gap property to create spacing between flex items.
      </SectionDescription>

      <Flex gap="lg" wrap="wrap">
        <DemoItem width="120px">Item 1</DemoItem>
        <DemoItem width="120px" color="#7e57c2">
          Item 2
        </DemoItem>
        <DemoItem width="120px" color="#5c6bc0">
          Item 3
        </DemoItem>
        <DemoItem width="120px" color="#4caf50">
          Item 4
        </DemoItem>
        <DemoItem width="120px" color="#ff9800">
          Item 5
        </DemoItem>
        <DemoItem width="120px" color="#f44336">
          Item 6
        </DemoItem>
      </Flex>

      <Flex direction="column" gap="md">
        <DemoItem height="60px">Item 1</DemoItem>
        <DemoItem height="60px" color="#7e57c2">
          Item 2
        </DemoItem>
        <DemoItem height="60px" color="#5c6bc0">
          Item 3
        </DemoItem>
      </Flex>
    </DemoContent>
  ),
};

// Common UI Patterns
export const CommonUIPatterns: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Common UI Patterns</SectionTitle>
      <SectionDescription>
        Demonstration of common UI patterns using Flex.
      </SectionDescription>

      <SectionTitle small spaced>
        Card Layout
      </SectionTitle>
      <Flex direction="column" className={cardLayoutWrapper}>
        <div
          style={{
            backgroundColor: '#5c6bc0',
            height: '180px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          Card Image
        </div>
        <Flex direction="column" gap="sm">
          <h3 style={{ margin: '0 0 8px 0' }}>Card Title</h3>
          <p style={{ margin: '0 0 16px 0', color: '#666' }}>
            This is a sample card layout created with the Flex component.
          </p>
          <Flex justifyContent="space-between" alignItems="center">
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: '#5c6bc0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Action
            </button>
            <span style={{ color: '#666' }}>Info text</span>
          </Flex>
        </Flex>
      </Flex>

      <SectionTitle small spaced>
        Split Layout
      </SectionTitle>
      {/* Flex always sets its own inline height ('100%' or 'auto'), so only an inline override can win here. */}
      {/* eslint-disable-next-line react/forbid-component-props */}
      <Flex style={{ height: '240px', overflow: 'hidden' }}>
        <Flex direction="column" justifyContent="center" flex="1" gap="md">
          <h3 style={{ margin: '0 0 16px 0' }}>Left Side</h3>
          <p style={{ margin: '0', opacity: 0.8 }}>
            Content for the left side of the split layout.
          </p>
        </Flex>
        <Flex direction="column" justifyContent="center" flex="1" gap="md">
          <h3 style={{ margin: '0 0 16px 0' }}>Right Side</h3>
          <p style={{ margin: '0', color: '#666' }}>
            Content for the right side of the split layout.
          </p>
        </Flex>
      </Flex>

      <SectionTitle small spaced>
        Navbar Layout
      </SectionTitle>
      <Flex justifyContent="space-between" alignItems="center">
        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Logo</div>
        <Flex gap="md">
          <button type="button" style={linkButtonStyle}>
            Home
          </button>
          <button type="button" style={linkButtonStyle}>
            Features
          </button>
          <button type="button" style={linkButtonStyle}>
            Pricing
          </button>
          <button type="button" style={linkButtonStyle}>
            About
          </button>
        </Flex>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#3f51b5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </Flex>

      <SectionTitle small spaced>
        Form Layout
      </SectionTitle>
      <Flex direction="column" gap="md" className={formLayoutWrapper}>
        <h3 style={{ margin: '0 0 8px 0' }}>Contact Form</h3>
        <Flex direction="column" gap="xs">
          <label htmlFor="flex-demo-name" style={{ fontWeight: 500 }}>
            Name
          </label>
          <input
            id="flex-demo-name"
            type="text"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </Flex>
        <Flex direction="column" gap="xs">
          <label htmlFor="flex-demo-email" style={{ fontWeight: 500 }}>
            Email
          </label>
          <input
            id="flex-demo-email"
            type="email"
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </Flex>
        <Flex direction="column" gap="xs">
          <label htmlFor="flex-demo-message" style={{ fontWeight: 500 }}>
            Message
          </label>
          <textarea
            id="flex-demo-message"
            rows={4}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </Flex>
        <Flex justifyContent="flex-end">
          <button
            style={{
              padding: '10px 24px',
              backgroundColor: '#3f51b5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Submit
          </button>
        </Flex>
      </Flex>
    </DemoContent>
  ),
};

// Responsive Flex
export const ResponsiveFlexLayouts: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Responsive Flex Layouts</SectionTitle>
      <SectionDescription>
        Examples of responsive flex layouts using media queries.
      </SectionDescription>

      <div>
        <SectionTitle small>
          Mobile-First Layout (resize browser to see changes)
        </SectionTitle>
        <Flex gap="md" direction="row" mobileDirection="column">
          <Flex direction="column" flex="1" gap="xs">
            <h4 style={{ margin: '0 0 8px 0' }}>Section 1</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              This section will stack vertically on mobile and horizontally on
              larger screens.
            </p>
          </Flex>

          <Flex direction="column" flex="1" gap="xs">
            <h4 style={{ margin: '0 0 8px 0' }}>Section 2</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Resize your browser window to see how the layout changes between
              mobile and desktop views.
            </p>
          </Flex>

          <Flex direction="column" flex="1" gap="xs">
            <h4 style={{ margin: '0 0 8px 0' }}>Section 3</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Using Flex with proper media queries creates responsive layouts
              without additional CSS.
            </p>
          </Flex>
        </Flex>
      </div>

      <SectionTitle small spaced>
        Responsive Gap Examples
      </SectionTitle>
      <Flex gap="lg" mobileGap="sm" direction="row" mobileDirection="column">
        {[...Array(3)].map((_, i) => (
          <Flex key={i} direction="column" flex="1" gap="xs">
            <h4 style={{ margin: '0 0 8px 0' }}>Responsive Gap</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>
              This layout uses a larger gap on desktop and a smaller gap on
              mobile.
            </p>
          </Flex>
        ))}
      </Flex>
    </DemoContent>
  ),
};

// Center Alignment Example
export const CenterAlignment: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Center Alignment</SectionTitle>
      <SectionDescription>
        Using the center prop to align items both horizontally and vertically.
      </SectionDescription>

      <Flex center>
        <DemoItem width="150px" height="80px">
          Centered Item
        </DemoItem>
      </Flex>

      <Flex center>
        <Flex
          direction="column"
          gap="md"
          center
          className={centeredContentWrapper}
        >
          <h3 style={{ margin: '0' }}>Centered Content</h3>
          <p style={{ margin: '0', textAlign: 'center' }}>
            This content is centered both horizontally and vertically using the
            center prop.
          </p>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#3f51b5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Action Button
          </button>
        </Flex>
      </Flex>
    </DemoContent>
  ),
};
