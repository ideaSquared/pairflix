import { style } from '@vanilla-extract/css';

export const blueTab = style({
  backgroundColor: '#e3f2fd',
  borderRadius: '4px 4px 0 0',
  fontWeight: 'bold',
});

export const yellowTab = style({
  backgroundColor: '#fff8e1',
  borderRadius: '4px 4px 0 0',
  fontWeight: 'bold',
});

export const greenTab = style({
  backgroundColor: '#f9fbe7',
  borderRadius: '4px 4px 0 0',
  fontWeight: 'bold',
});

export const bluePanel = style({
  backgroundColor: '#e3f2fd',
  borderRadius: '0 4px 4px 4px',
  padding: '16px',
  borderTop: 'none',
});

export const yellowPanel = style({
  backgroundColor: '#fff8e1',
  borderRadius: '0 4px 4px 4px',
  padding: '16px',
  borderTop: 'none',
});

export const greenPanel = style({
  backgroundColor: '#f9fbe7',
  borderRadius: '0 4px 4px 4px',
  padding: '16px',
  borderTop: 'none',
});

export const dynamicTab = style({
  display: 'flex',
  alignItems: 'center',
});
