import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Typography } from './Typography';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Typography variant="h3">Card Title</Typography>
        <Typography variant="body">This is a card component with default padding.</Typography>
      </>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <>
        <Typography variant="h3">Small Padding</Typography>
        <Typography variant="body">This card has small padding.</Typography>
      </>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <>
        <Typography variant="h3">Large Padding</Typography>
        <Typography variant="body">This card has large padding.</Typography>
      </>
    ),
  },
};

export const Hover: Story = {
  args: {
    hover: true,
    children: (
      <>
        <Typography variant="h3">Hover Effect</Typography>
        <Typography variant="body">Hover over this card to see the effect.</Typography>
      </>
    ),
  },
};
