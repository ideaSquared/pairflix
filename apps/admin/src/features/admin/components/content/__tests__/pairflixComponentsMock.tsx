// Extends the shared @pairflix/components mock
// (apps/admin/src/tests/__mocks__/components.tsx) with the primitives
// ContentModerationContent needs that the shared mock doesn't cover yet
// (Badge, Flex, Typography, the Table family, ...). Kept local to this
// directory -- rather than added to the shared file -- per this task's scope.
import type { ComponentPropsWithoutRef } from 'react';

// This file itself becomes the @pairflix/components mock (see
// ContentModerationContent.test.tsx), and the shared mock resolves to the
// same path the test.alias in vite.config.ts already maps that specifier to
// -- so a plain re-export here would recurse back into this same mock
// registration. vi.importActual bypasses the mock registry for this one
// lookup so we genuinely get the shared mock file's real contents instead.
export const {
  Button,
  Input,
  Card,
  Container,
  Text,
  Heading,
  Form,
  Label,
  Spinner,
  Modal,
  Alert,
  H2,
  ErrorText,
  InputGroup,
  CardContent,
  theme,
  vars,
  lightThemeClass,
  darkThemeClass,
  themeRoot,
} = await vi.importActual<
  typeof import('../../../../../tests/__mocks__/components')
>('../../../../../tests/__mocks__/components');

export const Badge = (props: ComponentPropsWithoutRef<'span'>) => (
  <span {...props} />
);

export const CardHeader = (props: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} />
);

export const Flex = (props: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} />
);

export const H4 = ({ children, ...props }: ComponentPropsWithoutRef<'h4'>) => (
  <h4 {...props}>{children}</h4>
);

export const Select = (props: ComponentPropsWithoutRef<'select'>) => (
  <select {...props} />
);

export const Textarea = (props: ComponentPropsWithoutRef<'textarea'>) => (
  <textarea {...props} />
);

export const Typography = (props: ComponentPropsWithoutRef<'span'>) => (
  <span {...props} />
);

export const Table = (props: ComponentPropsWithoutRef<'table'>) => (
  <table {...props} />
);

export const TableContainer = (props: ComponentPropsWithoutRef<'div'>) => (
  <div {...props} />
);

export const TableHead = (props: ComponentPropsWithoutRef<'thead'>) => (
  <thead {...props} />
);

export const TableBody = (props: ComponentPropsWithoutRef<'tbody'>) => (
  <tbody {...props} />
);

export const TableHeaderCell = (props: ComponentPropsWithoutRef<'th'>) => (
  <th {...props} />
);

export const TableCell = (props: ComponentPropsWithoutRef<'td'>) => (
  <td {...props} />
);

export const TableActionButton = (
  props: ComponentPropsWithoutRef<'button'>
) => <button {...props} />;
