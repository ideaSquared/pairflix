import type { Meta, StoryObj } from '@storybook/react-webpack5';
import styled from 'styled-components';

import { Box } from './Box';

const ColorBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 14px;
`;

const DemoContent = styled.div`
  font-family: ${({ theme }) => theme?.typography?.fontFamily || 'sans-serif'};
  padding: 20px;
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333'};
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 500;
`;

const SectionDescription = styled.p`
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme?.colors?.text?.secondary || '#666'};
  font-size: 14px;
`;

const PropsTable = styled.div`
  margin: 20px 0;
  font-size: 14px;
  border: 1px solid ${({ theme }) => theme?.colors?.border?.light || '#e0e0e0'};
  border-radius: 4px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 16px;
  background: ${({ theme }) =>
    theme?.colors?.background?.secondary || '#f5f5f5'};
  padding: 12px;
  font-weight: 600;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
  gap: 16px;
  padding: 12px;
  border-top: 1px solid
    ${({ theme }) => theme?.colors?.border?.light || '#e0e0e0'};
`;

const Code = styled.code`
  background: ${({ theme }) => theme?.colors?.background?.code || '#f5f5f5'};
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
`;

const CodeBlock = styled.pre`
  background: ${({ theme }) => theme?.colors?.background?.code || '#f5f5f5'};
  border-radius: 4px;
  padding: 16px;
  font-family: monospace;
  font-size: 13px;
  overflow-x: auto;
`;

const Meta: Meta<typeof Box> = {
  title: 'Layout/Box',
  component: Box,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A versatile layout primitive with extensive styling options through props.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Layout
    display: {
      control: 'select',
      options: ['flex', 'grid', 'block', 'inline-block', 'inline', 'none'],
      description: 'CSS display property',
    },
    width: {
      control: 'text',
      description: 'Width of the box',
    },
    height: {
      control: 'text',
      description: 'Height of the box',
    },
    // Spacing
    margin: {
      control: 'text',
      description: 'Margin on all sides',
    },
    padding: {
      control: 'text',
      description: 'Padding on all sides',
    },
    // Background & Borders
    backgroundColor: {
      control: 'color',
      description: 'Background color of the box',
    },
    borderRadius: {
      control: 'text',
      description: 'Border radius of the box',
    },
    boxShadow: {
      control: 'text',
      description: 'Box shadow of the box',
    },
    // children prop is special
    children: {
      control: 'text',
      description: 'Content of the box',
    },
  },
};

export default Meta;
type Story = StoryObj<typeof Box>;

// Basic Box
export const Basic: Story = {
  args: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    children: 'This is a basic Box',
  },
};

// Variants for different purposes
export const Variants: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Box Variants</SectionTitle>
      <SectionDescription>
        Boxes styled for different common use cases.
      </SectionDescription>

      <Box display="grid" gridGap="16px">
        <Box padding="16px" backgroundColor="#f5f5f5" borderRadius="4px">
          Simple content box
        </Box>

        <Box
          padding="16px"
          border="1px solid #e0e0e0"
          borderRadius="4px"
          boxShadow="0 2px 4px rgba(0,0,0,0.05)"
        >
          Card-like box with border and shadow
        </Box>

        <Box
          padding="16px"
          backgroundColor="#e8f4fd"
          borderLeft="4px solid #0077cc"
          borderRadius="2px"
        >
          Information banner style
        </Box>

        <Box
          padding="16px"
          backgroundColor="#fff8e1"
          borderLeft="4px solid #ffc107"
          borderRadius="2px"
        >
          Warning banner style
        </Box>

        <Box
          padding="16px"
          backgroundColor="#2196f3"
          borderRadius="4px"
          boxShadow="0 4px 6px rgba(33,150,243,0.3)"
        >
          Prominent action box with shadow
        </Box>
      </Box>
    </DemoContent>
  ),
};

// Spacing examples
export const Spacing: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Spacing Examples</SectionTitle>
      <SectionDescription>
        Demonstration of margin and padding properties.
      </SectionDescription>

      <Box backgroundColor="#f5f5f5" padding="24px">
        <SectionTitle>Padding Examples</SectionTitle>
        <Box display="grid" gridGap="16px">
          <ColorBox backgroundColor="#2196f3" padding="8px">
            padding: 8px
          </ColorBox>
          <ColorBox backgroundColor="#2196f3" padding="16px">
            padding: 16px
          </ColorBox>
          <ColorBox
            backgroundColor="#2196f3"
            paddingTop="8px"
            paddingRight="24px"
            paddingBottom="8px"
            paddingLeft="24px"
          >
            paddingTop: 8px, paddingRight: 24px, paddingBottom: 8px,
            paddingLeft: 24px
          </ColorBox>
        </Box>

        <Box marginTop="24px">
          <SectionTitle>Margin Examples</SectionTitle>
          <Box backgroundColor="#e0e0e0" padding="16px">
            <ColorBox backgroundColor="#9c27b0" padding="16px" margin="0">
              margin: 0
            </ColorBox>
            <ColorBox backgroundColor="#9c27b0" padding="16px" margin="16px 0">
              margin: 16px 0
            </ColorBox>
            <ColorBox backgroundColor="#9c27b0" padding="16px" margin="0 24px">
              margin: 0 24px
            </ColorBox>
          </Box>
        </Box>
      </Box>
    </DemoContent>
  ),
};

// Layout patterns
export const FlexboxLayouts: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Flexbox Layout Patterns</SectionTitle>
      <SectionDescription>
        Common flexbox layout patterns using Box.
      </SectionDescription>

      <Box marginBottom="24px">
        <Box marginBottom="8px">Row layout (default):</Box>
        <Box
          display="flex"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#e91e63" padding="16px" flex="1">
            Item 1
          </ColorBox>
          <ColorBox backgroundColor="#9c27b0" padding="16px" flex="1">
            Item 2
          </ColorBox>
          <ColorBox backgroundColor="#673ab7" padding="16px" flex="1">
            Item 3
          </ColorBox>
        </Box>
      </Box>

      <Box marginBottom="24px">
        <Box marginBottom="8px">Column layout:</Box>
        <Box
          display="flex"
          flexDirection="column"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#e91e63" padding="16px" marginBottom="8px">
            Item 1
          </ColorBox>
          <ColorBox backgroundColor="#9c27b0" padding="16px" marginBottom="8px">
            Item 2
          </ColorBox>
          <ColorBox backgroundColor="#673ab7" padding="16px">
            Item 3
          </ColorBox>
        </Box>
      </Box>

      <Box marginBottom="24px">
        <Box marginBottom="8px">Centered content:</Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="120px"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#2196f3" padding="24px">
            Centered Box
          </ColorBox>
        </Box>
      </Box>

      <Box marginBottom="24px">
        <Box marginBottom="8px">Space between:</Box>
        <Box
          display="flex"
          justifyContent="space-between"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#00bcd4" padding="16px">
            Left
          </ColorBox>
          <ColorBox backgroundColor="#00bcd4" padding="16px">
            Right
          </ColorBox>
        </Box>
      </Box>

      <Box>
        <Box marginBottom="8px">Flexible sizing:</Box>
        <Box
          display="flex"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#3f51b5" padding="16px" flex="1">
            flex: 1
          </ColorBox>
          <ColorBox backgroundColor="#2196f3" padding="16px" flex="2">
            flex: 2
          </ColorBox>
          <ColorBox backgroundColor="#03a9f4" padding="16px" flex="1">
            flex: 1
          </ColorBox>
        </Box>
      </Box>
    </DemoContent>
  ),
};

// Grid layouts
export const GridLayouts: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Grid Layout Patterns</SectionTitle>
      <SectionDescription>
        Common CSS Grid layout patterns using Box.
      </SectionDescription>

      <Box marginBottom="24px">
        <Box marginBottom="8px">Basic grid:</Box>
        <Box
          display="grid"
          gridGap="16px"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#4caf50" padding="16px">
            Item 1
          </ColorBox>
          <ColorBox backgroundColor="#8bc34a" padding="16px">
            Item 2
          </ColorBox>
          <ColorBox backgroundColor="#cddc39" padding="16px">
            Item 3
          </ColorBox>
          <ColorBox backgroundColor="#4caf50" padding="16px">
            Item 4
          </ColorBox>
          <ColorBox backgroundColor="#8bc34a" padding="16px">
            Item 5
          </ColorBox>
          <ColorBox backgroundColor="#cddc39" padding="16px">
            Item 6
          </ColorBox>
        </Box>
      </Box>

      <Box marginBottom="24px">
        <Box marginBottom="8px">Area-based grid:</Box>
        <Box
          display="grid"
          gridGap="16px"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#ff9800" padding="16px">
            Header
          </ColorBox>
          <ColorBox backgroundColor="#ff5722" padding="16px">
            Sidebar
          </ColorBox>
          <ColorBox backgroundColor="#f44336" padding="16px">
            Content
          </ColorBox>
          <ColorBox backgroundColor="#ff9800" padding="16px">
            Footer
          </ColorBox>
        </Box>
      </Box>

      <Box>
        <Box marginBottom="8px">Mixed column sizing:</Box>
        <Box
          display="grid"
          gridGap="16px"
          backgroundColor="#f5f5f5"
          padding="16px"
          borderRadius="4px"
        >
          <ColorBox backgroundColor="#9c27b0" padding="16px">
            Fixed
          </ColorBox>
          <ColorBox backgroundColor="#673ab7" padding="16px">
            Flexible (1fr)
          </ColorBox>
          <ColorBox backgroundColor="#3f51b5" padding="16px">
            Flexible (2fr)
          </ColorBox>
        </Box>
      </Box>
    </DemoContent>
  ),
};

// Positioning examples
export const Positioning: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Positioning Examples</SectionTitle>
      <SectionDescription>
        Demonstration of various positioning options.
      </SectionDescription>

      <Box
        position="relative"
        height="200px"
        backgroundColor="#f5f5f5"
        padding="16px"
        borderRadius="4px"
      >
        <Box
          position="absolute"
          top="16px"
          left="16px"
          padding="8px"
          backgroundColor="#e91e63"
          borderRadius="4px"
        >
          Top Left
        </Box>

        <Box
          position="absolute"
          top="16px"
          right="16px"
          padding="8px"
          backgroundColor="#9c27b0"
          borderRadius="4px"
        >
          Top Right
        </Box>

        <Box
          position="absolute"
          bottom="16px"
          left="16px"
          padding="8px"
          backgroundColor="#673ab7"
          borderRadius="4px"
        >
          Bottom Left
        </Box>

        <Box
          position="absolute"
          bottom="16px"
          right="16px"
          padding="8px"
          backgroundColor="#3f51b5"
          borderRadius="4px"
        >
          Bottom Right
        </Box>

        <Box
          position="absolute"
          top="50%"
          left="50%"
          padding="16px"
          backgroundColor="#2196f3"
          borderRadius="50%"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          Center
        </Box>
      </Box>
    </DemoContent>
  ),
};

// Styling examples
export const Styling: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Styling Examples</SectionTitle>
      <SectionDescription>
        Demonstration of background, border and shadow properties.
      </SectionDescription>

      <Box display="grid" gridGap="24px">
        <Box>
          <Box marginBottom="8px">Background colors:</Box>
          <Box display="flex" gridGap="16px" flexWrap="wrap">
            <Box
              width="150px"
              height="100px"
              backgroundColor="#f44336"
              borderRadius="4px"
            />
            <Box
              width="150px"
              height="100px"
              backgroundColor="#2196f3"
              borderRadius="4px"
            />
            <Box
              width="150px"
              height="100px"
              backgroundColor="#4caf50"
              borderRadius="4px"
            />
            <Box
              width="150px"
              height="100px"
              backgroundColor="#ff9800"
              borderRadius="4px"
            />
          </Box>
        </Box>

        <Box>
          <Box marginBottom="8px">Border styles:</Box>
          <Box display="flex" gridGap="16px" flexWrap="wrap">
            <Box
              width="150px"
              height="100px"
              border="1px solid #e0e0e0"
              borderRadius="4px"
            />
            <Box
              width="150px"
              height="100px"
              border="2px dashed #2196f3"
              borderRadius="4px"
            />
            <Box
              width="150px"
              height="100px"
              border="3px solid #9c27b0"
              borderRadius="8px"
            />
            <Box
              width="150px"
              height="100px"
              borderTop="4px solid #f44336"
              borderRight="4px solid #2196f3"
              borderBottom="4px solid #4caf50"
              borderLeft="4px solid #ff9800"
              borderRadius="4px"
            />
          </Box>
        </Box>

        <Box>
          <Box marginBottom="8px">Border radius:</Box>
          <Box display="flex" gridGap="16px" flexWrap="wrap">
            <Box
              width="100px"
              height="100px"
              backgroundColor="#e0e0e0"
              borderRadius="0"
            />
            <Box
              width="100px"
              height="100px"
              backgroundColor="#e0e0e0"
              borderRadius="4px"
            />
            <Box
              width="100px"
              height="100px"
              backgroundColor="#e0e0e0"
              borderRadius="12px"
            />
            <Box
              width="100px"
              height="100px"
              backgroundColor="#e0e0e0"
              borderRadius="24px"
            />
            <Box
              width="100px"
              height="100px"
              backgroundColor="#e0e0e0"
              borderRadius="50%"
            />
          </Box>
        </Box>

        <Box>
          <Box marginBottom="8px">Box shadows:</Box>
          <Box display="flex" gridGap="24px" flexWrap="wrap">
            <Box
              width="150px"
              height="100px"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              Light
            </Box>
            <Box
              width="150px"
              height="100px"
              boxShadow="0 4px 8px rgba(0,0,0,0.2)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              Medium
            </Box>
            <Box
              width="150px"
              height="100px"
              boxShadow="0 8px 16px rgba(0,0,0,0.3)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              Heavy
            </Box>
          </Box>
        </Box>
      </Box>
    </DemoContent>
  ),
};

// Real-world examples
export const RealWorldExamples: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Real-World Examples</SectionTitle>
      <SectionDescription>
        Examples of how Box can be used in real-world UI components.
      </SectionDescription>

      {/* Card component */}
      <Box marginBottom="32px">
        <Box marginBottom="8px">Card component:</Box>
        <Box
          borderRadius="8px"
          boxShadow="0 2px 8px rgba(0,0,0,0.1)"
          maxWidth="400px"
        >
          <Box
            height="200px"
            backgroundColor="#3f51b5"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            Featured Image
          </Box>
          <Box padding="24px">
            <Box marginBottom="8px">Card Title</Box>
            <Box marginBottom="16px">
              This is a sample card component built entirely with Box
              components. It demonstrates how flexible the Box component can be.
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box
                as="button"
                backgroundColor="#3f51b5"
                border="none"
                borderRadius="4px"
                padding="8px 16px"
              >
                Action Button
              </Box>
              <Box>June 6, 2025</Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Modal dialog */}
      <Box marginBottom="32px">
        <Box marginBottom="8px">Modal dialog:</Box>
        <Box
          position="relative"
          backgroundColor="#f5f5f5"
          padding="32px"
          borderRadius="8px"
          minHeight="300px"
        >
          <Box
            position="relative"
            width="80%"
            maxWidth="500px"
            margin="0 auto"
            borderRadius="8px"
            boxShadow="0 8px 16px rgba(0,0,0,0.2)"
          >
            <Box
              backgroundColor="#2196f3"
              padding="16px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>Modal Title</Box>
              <Box
                width="24px"
                height="24px"
                borderRadius="50%"
                backgroundColor="rgba(255,255,255,0.2)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                ✕
              </Box>
            </Box>
            <Box padding="24px">
              <Box marginBottom="24px">
                This is a sample modal dialog built with Box components. It
                demonstrates how you can create complex UI structures.
              </Box>
              <Box display="flex" justifyContent="flex-end" gridGap="12px">
                <Box
                  as="button"
                  border="1px solid #e0e0e0"
                  borderRadius="4px"
                  padding="8px 16px"
                >
                  Cancel
                </Box>
                <Box
                  as="button"
                  backgroundColor="#2196f3"
                  border="none"
                  borderRadius="4px"
                  padding="8px 16px"
                >
                  Confirm
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Dashboard layout */}
      <Box>
        <Box marginBottom="8px">Dashboard layout:</Box>
        <Box
          display="grid"
          minHeight="400px"
          border="1px solid #e0e0e0"
          borderRadius="8px"
        >
          <Box
            backgroundColor="#2c3e50"
            padding="0 24px"
            display="flex"
            alignItems="center"
          >
            <Box>PairFlix Dashboard</Box>
          </Box>
          <Box backgroundColor="#34495e" padding="16px">
            <Box marginBottom="24px">Navigation</Box>
            {['Dashboard', 'Movies', 'TV Shows', 'Settings', 'Profile'].map(
              (item, index) => (
                <Box
                  key={index}
                  padding="12px 16px"
                  marginBottom="4px"
                  borderRadius="4px"
                  backgroundColor={
                    index === 0 ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }
                >
                  {item}
                </Box>
              )
            )}
          </Box>
          <Box padding="24px" backgroundColor="#f9f9f9">
            <Box marginBottom="24px">Dashboard Overview</Box>
            <Box display="grid" gridGap="16px" marginBottom="32px">
              {['Total Views', 'Watchlist', 'Favorites', 'Reviews'].map(
                (item, index) => (
                  <Box
                    key={index}
                    borderRadius="8px"
                    padding="20px"
                    boxShadow="0 2px 4px rgba(0,0,0,0.05)"
                  >
                    <Box marginBottom="8px">{item}</Box>
                    <Box>{Math.floor(Math.random() * 100)}</Box>
                  </Box>
                )
              )}
            </Box>
            <Box
              borderRadius="8px"
              padding="20px"
              boxShadow="0 2px 4px rgba(0,0,0,0.05)"
            >
              <Box marginBottom="16px">Recent Activity</Box>
              <Box>
                {[
                  'Watched Inception',
                  'Added Tenet to watchlist',
                  'Rated Interstellar',
                  'Reviewed The Dark Knight',
                ].map((item, index) => (
                  <Box
                    key={index}
                    padding="12px 0"
                    borderBottom={index < 3 ? '1px solid #f0f0f0' : 'none'}
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Box>{item}</Box>
                    <Box>Today</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </DemoContent>
  ),
};

// Props reference
export const PropsReference: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Box Props Reference</SectionTitle>
      <SectionDescription>
        Comprehensive list of all available props on the Box component.
      </SectionDescription>

      <Box marginBottom="24px">
        <CodeBlock>
          {`<Box
  // Layout
  display="flex"
  width="100%"
  height="auto"
  minWidth="200px"
  minHeight="100px"
  maxWidth="800px"
  maxHeight="600px"
  
  // Spacing
  margin="16px"
  marginTop="8px"
  marginRight="16px"
  marginBottom="8px"
  marginLeft="16px"
  padding="16px"
  paddingTop="8px"
  paddingRight="16px"
  paddingBottom="8px"
  paddingLeft="16px"
  
  // Flexbox
  alignItems="center"
  alignContent="center"
  justifyContent="space-between"
  flexDirection="row"
  flexWrap="wrap"
  flex="1"
  
  // Grid
  gridGap="16px"
  gridColumnGap="16px"
  gridRowGap="8px"
  gridColumn="1 / 3"
  gridRow="1 / 3"
  
  // Positioning
  position="relative"
  top="0"
  right="0"
  bottom="0"
  left="0"
  zIndex={1}
  
  // Background & Borders
  background="linear-gradient(to right, #f5f5f5, #e0e0e0)"
  backgroundColor="#f5f5f5"
  backgroundImage="url('image.jpg')"
  backgroundSize="cover"
  backgroundPosition="center"
  backgroundRepeat="no-repeat"
  border="1px solid #e0e0e0"
  borderTop="1px solid #e0e0e0"
  borderRight="1px solid #e0e0e0"
  borderBottom="1px solid #e0e0e0"
  borderLeft="1px solid #e0e0e0"
  borderRadius="4px"
  boxShadow="0 2px 4px rgba(0,0,0,0.1)"
>
  Content goes here
</Box>`}
        </CodeBlock>
      </Box>

      <Box>
        <SectionTitle style={{ fontSize: '16px' }}>
          Available Props
        </SectionTitle>
        <PropsTable>
          <TableHeader>
            <div>Prop</div>
            <div>Type</div>
            <div>Description</div>
          </TableHeader>

          <TableRow>
            <div>
              <Code>as</Code>
            </div>
            <div>
              <Code>React.ElementType</Code>
            </div>
            <div>
              The HTML element or React component to be rendered (default is
              'div')
            </div>
          </TableRow>

          {/* Layout Properties */}
          <TableRow>
            <div>
              <Code>display</Code>
            </div>
            <div>
              <Code>string</Code>
            </div>
            <div>CSS display property (e.g., 'flex', 'grid', 'block')</div>
          </TableRow>
          <TableRow>
            <div>
              <Code>width</Code>
            </div>
            <div>
              <Code>string | number</Code>
            </div>
            <div>Width of the box</div>
          </TableRow>
          <TableRow>
            <div>
              <Code>height</Code>
            </div>
            <div>
              <Code>string | number</Code>
            </div>
            <div>Height of the box</div>
          </TableRow>

          {/* Spacing Properties */}
          <TableRow>
            <div>
              <Code>margin</Code>
            </div>
            <div>
              <Code>string | number</Code>
            </div>
            <div>Margin on all sides</div>
          </TableRow>
          <TableRow>
            <div>
              <Code>padding</Code>
            </div>
            <div>
              <Code>string | number</Code>
            </div>
            <div>Padding on all sides</div>
          </TableRow>

          {/* Flexbox Properties */}
          <TableRow>
            <div>
              <Code>flexDirection</Code>
            </div>
            <div>
              <Code>string</Code>
            </div>
            <div>CSS flex-direction property (e.g., 'row', 'column')</div>
          </TableRow>
          <TableRow>
            <div>
              <Code>alignItems</Code>
            </div>
            <div>
              <Code>string</Code>
            </div>
            <div>CSS align-items property</div>
          </TableRow>
          <TableRow>
            <div>
              <Code>justifyContent</Code>
            </div>
            <div>
              <Code>string</Code>
            </div>
            <div>CSS justify-content property</div>
          </TableRow>

          {/* Grid Properties */}
          <TableRow>
            <div>
              <Code>gridGap</Code>
            </div>
            <div>
              <Code>string | number</Code>
            </div>
            <div>CSS grid-gap property</div>
          </TableRow>

          {/* Positioning Properties */}
          <TableRow>
            <div>
              <Code>position</Code>
            </div>
            <div>
              <Code>string</Code>
            </div>
            <div>CSS position property (e.g., 'relative', 'absolute')</div>
          </TableRow>

          {/* Background & Border Properties */}
          <TableRow>
            <div>
              <Code>backgroundColor</Code>
            </div>
            <div>
              <Code>string</Code>
            </div>
            <div>CSS background-color property</div>
          </TableRow>
          <TableRow>
            <div>
              <Code>borderRadius</Code>
            </div>
            <div>
              <Code>string | number</Code>
            </div>
            <div>CSS border-radius property</div>
          </TableRow>
          <TableRow>
            <div>
              <Code>boxShadow</Code>
            </div>
            <div>
              <Code>string</Code>
            </div>
            <div>CSS box-shadow property</div>
          </TableRow>
        </PropsTable>
        <SectionDescription>
          Note: This is a partial list. The Box component supports many
          additional props for styling. See the component code for a complete
          reference.
        </SectionDescription>
      </Box>
    </DemoContent>
  ),
};

// Custom component as Box
export const AsProperty: Story = {
  render: () => (
    <DemoContent>
      <SectionTitle>Using the "as" Property</SectionTitle>
      <SectionDescription>
        The Box component can render as any HTML element or React component
        using the "as" prop.
      </SectionDescription>

      <Box display="grid" gridGap="24px">
        <Box>
          <Box marginBottom="8px">Render as different HTML elements:</Box>
          <Box display="grid" gridGap="16px">
            <Box
              as="section"
              padding="16px"
              backgroundColor="#f5f5f5"
              borderRadius="4px"
            >
              This Box renders as a <Code>section</Code> element
            </Box>

            <Box
              as="button"
              padding="12px 24px"
              backgroundColor="#2196f3"
              border="none"
              borderRadius="4px"
            >
              This Box renders as a button
            </Box>

            <Box as="a" padding="8px 16px">
              This Box renders as an anchor link
            </Box>
          </Box>
        </Box>

        <Box>
          <Box marginBottom="8px">Semantic HTML with Box:</Box>
          <Box as="article" border="1px solid #e0e0e0" borderRadius="4px">
            <Box
              as="header"
              padding="16px"
              backgroundColor="#f5f5f5"
              borderBottom="1px solid #e0e0e0"
            >
              <Box as="h2" margin="0">
                Article Title
              </Box>
            </Box>
            <Box as="main" padding="16px">
              <Box as="p">
                This is the main content of the article, wrapped in a paragraph.
              </Box>
            </Box>
            <Box
              as="footer"
              padding="16px"
              backgroundColor="#f5f5f5"
              borderTop="1px solid #e0e0e0"
            >
              Article footer
            </Box>
          </Box>
        </Box>
      </Box>
    </DemoContent>
  ),
};
