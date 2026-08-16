import { styleVariants } from '@vanilla-extract/css';

const base = {
  position: 'fixed',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  maxWidth: '100%',
  width: 'max-content',
} as const;

export const toastContainer = styleVariants({
  'top-right': { ...base, top: '1rem', right: '1rem' },
  'top-left': { ...base, top: '1rem', left: '1rem' },
  'bottom-right': { ...base, bottom: '1rem', right: '1rem' },
  'bottom-left': { ...base, bottom: '1rem', left: '1rem' },
  'top-center': {
    ...base,
    top: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  'bottom-center': {
    ...base,
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
  },
});
