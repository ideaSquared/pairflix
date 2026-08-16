import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Utility/Typography',
  component: Typography,
  tags: ['autodocs'],
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
};
export default meta;
type Story = StoryObj<typeof Typography>;

export const Variants: Story = {
  render: () => (
    <>
      <Typography variant="h1">H1 Heading</Typography>
      <Typography variant="h2">H2 Heading</Typography>
      <Typography variant="h3">H3 Heading</Typography>
      <Typography variant="h4">H4 Heading</Typography>
      <Typography variant="h5">H5 Heading</Typography>
      <Typography variant="h6">H6 Heading</Typography>
      <Typography variant="body1">Body1 text</Typography>
      <Typography variant="body2">Body2 text</Typography>
      <Typography variant="caption">Caption text</Typography>
      <Typography variant="error">Error text</Typography>
      <Typography variant="success">Success text</Typography>
      <Typography variant="overline">Overline text</Typography>
      <Typography variant="code">Code text</Typography>
    </>
  ),
};

export const Playground: Story = {
  args: {
    variant: 'body1',
    align: 'left',
    gutterBottom: false,
    color: '',
    weight: undefined,
    truncate: false,
    lines: 1,
    noWrap: false,
    uppercase: false,
    children: 'The quick brown fox jumps over the lazy dog',
  },
};
