import { forwardRef, type CSSProperties } from 'react';
import type { BaseComponentProps } from '../../../types';

export interface BoxStyleProps {
  // Layout
  display?: string;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;

  // Spacing
  margin?: string | number;
  marginTop?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  padding?: string | number;
  paddingTop?: string | number;
  paddingRight?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;

  // Flexbox
  alignItems?: string;
  alignContent?: string;
  justifyContent?: string;
  flexDirection?: string;
  flexWrap?: string;
  flex?: string | number;

  // Grid
  gridGap?: string | number;
  gridColumnGap?: string | number;
  gridRowGap?: string | number;
  gridColumn?: string;
  gridRow?: string;

  // Positioning
  position?: string;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: number;

  // Background & Borders
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string | number;
  boxShadow?: string;
}

export interface BoxProps extends BaseComponentProps, BoxStyleProps {
  /**
   * The HTML element or React component to be rendered
   * @default 'div'
   */
  as?: React.ElementType;
}

// Box is a style-prop passthrough (every field is an arbitrary CSS value, not
// a theme token), so it renders straight to inline styles rather than a
// vanilla-extract class -- there's no static CSS to extract here.
// BoxStyleProps intentionally types every field as a loose string/number
// (arbitrary CSS values, not theme tokens), which is narrower than
// CSSProperties' per-property unions -- cast at this boundary.
const boxStyle = (props: BoxStyleProps) =>
  ({
    ...(props.display && { display: props.display }),
    ...(props.width && { width: props.width }),
    ...(props.height && { height: props.height }),
    ...(props.minWidth && { minWidth: props.minWidth }),
    ...(props.minHeight && { minHeight: props.minHeight }),
    ...(props.maxWidth && { maxWidth: props.maxWidth }),
    ...(props.maxHeight && { maxHeight: props.maxHeight }),

    ...(props.margin && { margin: props.margin }),
    ...(props.marginTop && { marginTop: props.marginTop }),
    ...(props.marginRight && { marginRight: props.marginRight }),
    ...(props.marginBottom && { marginBottom: props.marginBottom }),
    ...(props.marginLeft && { marginLeft: props.marginLeft }),
    ...(props.padding && { padding: props.padding }),
    ...(props.paddingTop && { paddingTop: props.paddingTop }),
    ...(props.paddingRight && { paddingRight: props.paddingRight }),
    ...(props.paddingBottom && { paddingBottom: props.paddingBottom }),
    ...(props.paddingLeft && { paddingLeft: props.paddingLeft }),

    ...(props.alignItems && { alignItems: props.alignItems }),
    ...(props.alignContent && { alignContent: props.alignContent }),
    ...(props.justifyContent && { justifyContent: props.justifyContent }),
    ...(props.flexDirection && { flexDirection: props.flexDirection }),
    ...(props.flexWrap && { flexWrap: props.flexWrap }),
    ...(props.flex && { flex: props.flex }),

    ...(props.gridGap && { gridGap: props.gridGap }),
    ...(props.gridColumnGap && { gridColumnGap: props.gridColumnGap }),
    ...(props.gridRowGap && { gridRowGap: props.gridRowGap }),
    ...(props.gridColumn && { gridColumn: props.gridColumn }),
    ...(props.gridRow && { gridRow: props.gridRow }),

    ...(props.position && { position: props.position }),
    ...(props.top && { top: props.top }),
    ...(props.right && { right: props.right }),
    ...(props.bottom && { bottom: props.bottom }),
    ...(props.left && { left: props.left }),
    ...(props.zIndex && { zIndex: props.zIndex }),

    ...(props.background && { background: props.background }),
    ...(props.backgroundColor && { backgroundColor: props.backgroundColor }),
    ...(props.backgroundImage && { backgroundImage: props.backgroundImage }),
    ...(props.backgroundSize && { backgroundSize: props.backgroundSize }),
    ...(props.backgroundPosition && {
      backgroundPosition: props.backgroundPosition,
    }),
    ...(props.backgroundRepeat && {
      backgroundRepeat: props.backgroundRepeat,
    }),
    ...(props.border && { border: props.border }),
    ...(props.borderTop && { borderTop: props.borderTop }),
    ...(props.borderRight && { borderRight: props.borderRight }),
    ...(props.borderBottom && { borderBottom: props.borderBottom }),
    ...(props.borderLeft && { borderLeft: props.borderLeft }),
    ...(props.borderRadius && { borderRadius: props.borderRadius }),
    ...(props.boxShadow && { boxShadow: props.boxShadow }),
  }) as CSSProperties;

/**
 * Box component - a flexible layout primitive
 * @component
 * @example
 * ```tsx
 * <Box p="md" bg="primary.50" borderRadius="md">
 *   Content here
 * </Box>
 * ```
 */
export const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      as: Component = 'div',
      children,
      className,
      style,
      display,
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      padding,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      alignItems,
      alignContent,
      justifyContent,
      flexDirection,
      flexWrap,
      flex,
      gridGap,
      gridColumnGap,
      gridRowGap,
      gridColumn,
      gridRow,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      background,
      backgroundColor,
      backgroundImage,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat,
      border,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      borderRadius,
      boxShadow,
      ...rest
    },
    ref
  ) => {
    const computedStyle = boxStyle({
      display,
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      padding,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      alignItems,
      alignContent,
      justifyContent,
      flexDirection,
      flexWrap,
      flex,
      gridGap,
      gridColumnGap,
      gridRowGap,
      gridColumn,
      gridRow,
      position,
      top,
      right,
      bottom,
      left,
      zIndex,
      background,
      backgroundColor,
      backgroundImage,
      backgroundSize,
      backgroundPosition,
      backgroundRepeat,
      border,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      borderRadius,
      boxShadow,
    });

    return (
      // Box is an arbitrary-CSS-value passthrough primitive (see BoxStyleProps) --
      // there are no theme-token variants to extract into a vanilla-extract class.
      <Component
        ref={ref}
        className={className}
        // eslint-disable-next-line react/forbid-component-props
        style={{ ...computedStyle, ...style }}
        {...rest}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';

export default Box;
