import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@pairflix/components';

export const profileContainer = style({
  maxWidth: '600px',
  margin: '0 auto',
  padding: vars.spacing.md,
});

export const userInfo = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: vars.spacing.md,
  alignItems: 'center',
});

export const label = style({
  color: vars.colors.text.secondary,
  fontSize: vars.typography.fontSize.sm,
});

export const value = style({
  color: vars.colors.text.primary,
  fontSize: vars.typography.fontSize.md,
});

export const styledForm = style({
  marginBottom: vars.spacing.lg,
});

// Overrides Card's own child layout -- relies on this module being
// evaluated after `@pairflix/components` (see the import order in
// ProfilePage.tsx) so these rules land later in the stylesheet and win.
export const formCard = style({});

globalStyle(`${formCard} > div`, {
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

globalStyle(`${formCard} button`, {
  marginTop: vars.spacing.sm,
});

export const preferencesCard = style({});

globalStyle(`${preferencesCard} .preference-row`, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.sm} 0`,
  borderBottom: `1px solid ${vars.colors.border}`,
});

globalStyle(`${preferencesCard} .preference-row:last-child`, {
  borderBottom: 'none',
});

globalStyle(`${preferencesCard} .preference-row select`, {
  width: '150px',
});

export const errorMessage = style({
  color: vars.colors.text.error,
  marginBottom: vars.spacing.sm,
});

export const successMessage = style({
  color: vars.colors.text.success,
  marginBottom: vars.spacing.sm,
});

export const switchLabel = style({
  position: 'relative',
  display: 'inline-block',
  width: '52px',
  height: '26px',
});

globalStyle(`${switchLabel} input`, {
  opacity: 0,
  width: 0,
  height: 0,
});

globalStyle(`${switchLabel} span`, {
  position: 'absolute',
  cursor: 'pointer',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: vars.colors.background.secondary,
  transition: '0.3s',
  borderRadius: '26px',
  border: `1px solid ${vars.colors.border}`,
});

globalStyle(`${switchLabel} span:before`, {
  position: 'absolute',
  content: '""',
  height: '18px',
  width: '18px',
  left: '3px',
  bottom: '3px',
  background: vars.colors.text.secondary,
  transition: '0.3s',
  borderRadius: '50%',
});

globalStyle(`${switchLabel} input:checked + span`, {
  background: vars.colors.primary,
});

globalStyle(`${switchLabel} input:checked + span:before`, {
  background: vars.colors.text.primary,
  transform: 'translateX(26px)',
});

globalStyle(`${switchLabel}:hover span:before`, {
  boxShadow: `0 0 2px ${vars.colors.primary}`,
});
