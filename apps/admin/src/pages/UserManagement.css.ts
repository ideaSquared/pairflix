import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@pairflix/components';

export const userGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
  marginTop: '20px',
});

export const userCard = style({
  backgroundColor: vars.colors.background.secondary,
  borderRadius: vars.borderRadius.md,
  padding: vars.spacing.md,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

export const userHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: vars.spacing.md,
});

// `status` is a closed 5-value union (only `active`/`suspended`/`banned` had
// their own switch case; `pending`/`inactive` fell through the same default
// grey styling) -- expanded into explicit variants for all 5 rather than a
// `default` key, since the real prop type has no `default` member.
export const statusBadge = recipe({
  base: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  variants: {
    status: {
      active: { backgroundColor: '#d4edda', color: '#155724' },
      suspended: { backgroundColor: '#fff3cd', color: '#856404' },
      banned: { backgroundColor: '#f8d7da', color: '#721c24' },
      pending: { backgroundColor: '#e2e3e5', color: '#383d41' },
      inactive: { backgroundColor: '#e2e3e5', color: '#383d41' },
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});
