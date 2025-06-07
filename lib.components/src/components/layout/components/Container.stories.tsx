import type { Meta, StoryObj } from '@storybook/react-webpack5';
import styled from 'styled-components';

import { Container } from './Container';
import { Flex } from './Flex';

// Styled components for demonstration
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

// Content block to show container boundaries
const ContentBlock = styled.div<{ bgColor?: string }>`
	background-color: ${({ bgColor, theme }) =>
		bgColor || theme?.colors?.background?.secondary || '#f5f5f5'};
	padding: 16px;
	border-radius: 8px;
	width: 100%;
	min-height: 80px;
	box-shadow: ${({ theme }) =>
		theme?.shadows?.sm || '0 1px 3px rgba(0, 0, 0, 0.12)'};
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: relative;
`;

// Container visualization helper - Fixed the type definition to accept boolean
const ContainerVisualization = styled.div<{ dark?: boolean }>`
	width: 100%;
	background-color: ${({ dark }) => (dark ? '#f0f0f0' : '#ffffff')};
	border: 1px dashed #ccc;
	padding: 24px;
	border-radius: 8px;
	margin-bottom: 24px;
	position: relative;
`;

const ContainerLabel = styled.div`
	position: absolute;
	top: -10px;
	left: 16px;
	background-color: #ffffff;
	padding: 0 8px;
	font-size: 12px;
	color: #666;
	font-weight: 500;
`;

// Width indicator to show container dimensions
const WidthIndicator = styled.div`
	position: absolute;
	bottom: 8px;
	right: 8px;
	background-color: rgba(0, 0, 0, 0.1);
	color: #666;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-family: monospace;
`;

const Meta: Meta<typeof Container> = {
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
		fullWidth: {
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

export default Meta;
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
				<ContainerLabel>maxWidth="sm" (600px)</ContainerLabel>
				<Container maxWidth='sm'>
					<ContentBlock>
						<h4>Small Container (sm)</h4>
						<p>Maximum width: 600px</p>
						<WidthIndicator>max-width: 600px</WidthIndicator>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>maxWidth="md" (960px)</ContainerLabel>
				<Container maxWidth='md'>
					<ContentBlock>
						<h4>Medium Container (md)</h4>
						<p>Maximum width: 960px</p>
						<WidthIndicator>max-width: 960px</WidthIndicator>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>maxWidth="lg" (1280px) - Default</ContainerLabel>
				<Container maxWidth='lg'>
					<ContentBlock>
						<h4>Large Container (lg)</h4>
						<p>Maximum width: 1280px - This is the default</p>
						<WidthIndicator>max-width: 1280px</WidthIndicator>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>maxWidth="xl" (1920px)</ContainerLabel>
				<Container maxWidth='xl'>
					<ContentBlock>
						<h4>Extra Large Container (xl)</h4>
						<p>Maximum width: 1920px</p>
						<WidthIndicator>max-width: 1920px</WidthIndicator>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>maxWidth="none" (or fluid=true)</ContainerLabel>
				<Container maxWidth='none'>
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
				<ContainerLabel>padding="xs" (0.25rem)</ContainerLabel>
				<Container padding='xs' style={{ backgroundColor: '#f5f5f5' }}>
					<ContentBlock bgColor='#ffffff'>
						<p>Extra Small Padding (xs)</p>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization>
				<ContainerLabel>padding="sm" (0.5rem)</ContainerLabel>
				<Container padding='sm' style={{ backgroundColor: '#f5f5f5' }}>
					<ContentBlock bgColor='#ffffff'>
						<p>Small Padding (sm)</p>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization>
				<ContainerLabel>padding="md" (1rem) - Default</ContainerLabel>
				<Container padding='md' style={{ backgroundColor: '#f5f5f5' }}>
					<ContentBlock bgColor='#ffffff'>
						<p>Medium Padding (md) - Default</p>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization>
				<ContainerLabel>padding="lg" (1.5rem)</ContainerLabel>
				<Container padding='lg' style={{ backgroundColor: '#f5f5f5' }}>
					<ContentBlock bgColor='#ffffff'>
						<p>Large Padding (lg)</p>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization>
				<ContainerLabel>padding="xl" (2rem)</ContainerLabel>
				<Container padding='xl' style={{ backgroundColor: '#f5f5f5' }}>
					<ContentBlock bgColor='#ffffff'>
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
				<Container maxWidth='md'>
					<ContentBlock>
						<h4>Centered Container</h4>
						<p>Container is horizontally centered with auto margins</p>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>Non-Centered Container (centered=false)</ContainerLabel>
				<Container maxWidth='md' centered={false}>
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
				Using fullWidth prop to take 100% width of parent.
			</SectionDescription>

			<ContainerVisualization dark>
				<ContainerLabel>Regular Container</ContainerLabel>
				<Container maxWidth='md'>
					<ContentBlock>
						<h4>Regular Container</h4>
						<p>Has auto width and respects max-width</p>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>Full Width Container (fullWidth=true)</ContainerLabel>
				<Container maxWidth='md' fullWidth>
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
				<ContainerLabel>Custom Width (width="70%")</ContainerLabel>
				<Container width='70%'>
					<ContentBlock>
						<h4>Custom Width Container</h4>
						<p>Uses a specific width (70%)</p>
						<WidthIndicator>width: 70%</WidthIndicator>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>Custom Min Width (minWidth="400px")</ContainerLabel>
				<Container minWidth='400px' maxWidth='md'>
					<ContentBlock>
						<h4>Container with Min Width</h4>
						<p>Will not shrink below 400px</p>
						<WidthIndicator>min-width: 400px</WidthIndicator>
					</ContentBlock>
				</Container>
			</ContainerVisualization>

			<ContainerVisualization dark>
				<ContainerLabel>
					Custom Max Width (customMaxWidth="800px")
				</ContainerLabel>
				<Container customMaxWidth='800px'>
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
				<Container style={{ backgroundColor: '#f5f5f5' }}>
					<ContentBlock bgColor='#ffffff'>
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
				<Container noPaddingOnMobile style={{ backgroundColor: '#f5f5f5' }}>
					<ContentBlock bgColor='#ffffff'>
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
					style={{ backgroundColor: '#f5f5f5' }}
				>
					<ContentBlock bgColor='#ffffff'>
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

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Page Layout
			</SectionTitle>
			<ContainerVisualization dark>
				<Container>
					<Flex direction='column' gap='md'>
						<ContentBlock bgColor='#e1f5fe'>
							<h3>Page Header</h3>
							<p>Typically contains navigation, logo, user menu</p>
						</ContentBlock>
						<ContentBlock bgColor='#e8f5e9' style={{ minHeight: '180px' }}>
							<h3>Page Content</h3>
							<p>
								Main content area with contained width for better readability
							</p>
						</ContentBlock>
						<ContentBlock bgColor='#fff3e0'>
							<h3>Page Footer</h3>
							<p>Contains links, copyright information, etc.</p>
						</ContentBlock>
					</Flex>
				</Container>
			</ContainerVisualization>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Form Container
			</SectionTitle>
			<ContainerVisualization dark>
				<Container maxWidth='sm' padding='lg'>
					<ContentBlock bgColor='#f9f9f9' style={{ padding: '24px' }}>
						<h3 style={{ marginTop: 0 }}>Sign In</h3>
						<Flex direction='column' gap='md' style={{ width: '100%' }}>
							<Flex direction='column' gap='xs'>
								<label style={{ fontWeight: 500 }}>Email</label>
								<input
									type='email'
									style={{
										padding: '10px',
										border: '1px solid #ddd',
										borderRadius: '4px',
										width: '100%',
									}}
								/>
							</Flex>
							<Flex direction='column' gap='xs'>
								<label style={{ fontWeight: 500 }}>Password</label>
								<input
									type='password'
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

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
				Content with Sidebar
			</SectionTitle>
			<ContainerVisualization dark>
				<Container>
					<Flex gap='md'>
						<Flex direction='column' gap='md' style={{ flex: '0 0 250px' }}>
							<ContentBlock bgColor='#e3f2fd'>
								<h4>Sidebar</h4>
								<p>Navigation or filters</p>
							</ContentBlock>
						</Flex>
						<Flex direction='column' gap='md' style={{ flex: 1 }}>
							<ContentBlock bgColor='#f5f5f5' style={{ minHeight: '200px' }}>
								<h4>Main Content</h4>
								<p>Page content with constrained width</p>
							</ContentBlock>
						</Flex>
					</Flex>
				</Container>
			</ContainerVisualization>

			<SectionTitle style={{ fontSize: '16px', marginTop: '24px' }}>
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
			<Container style={{ marginTop: '24px' }}>
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
				<ContainerLabel>Outer Container (maxWidth="lg")</ContainerLabel>
				<Container
					maxWidth='lg'
					style={{ backgroundColor: '#f0f0f0', padding: '24px' }}
				>
					<h3>Outer Container</h3>
					<p style={{ marginBottom: '16px' }}>
						This is the outer container with maxWidth="lg"
					</p>

					<ContainerVisualization>
						<ContainerLabel>Inner Container (maxWidth="md")</ContainerLabel>
						<Container
							maxWidth='md'
							style={{ backgroundColor: '#e0e0e0', padding: '16px' }}
						>
							<h4>Inner Container</h4>
							<p style={{ marginBottom: '16px' }}>
								This is an inner container with maxWidth="md"
							</p>

							<ContainerVisualization>
								<ContainerLabel>
									Innermost Container (maxWidth="sm")
								</ContainerLabel>
								<Container
									maxWidth='sm'
									style={{ backgroundColor: '#d0d0d0', padding: '16px' }}
								>
									<ContentBlock>
										<h5>Innermost Container</h5>
										<p>This is the innermost container with maxWidth="sm"</p>
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
