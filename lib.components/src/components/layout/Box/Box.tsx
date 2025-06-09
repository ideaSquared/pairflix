import { forwardRef } from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';

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

const StyledBox = styled.div<BoxStyleProps>`
  ${props => props.display && `display: ${props.display};`}
  ${props => props.width && `width: ${props.width};`}
  ${props => props.height && `height: ${props.height};`}
  ${props => props.minWidth && `min-width: ${props.minWidth};`}
  ${props => props.minHeight && `min-height: ${props.minHeight};`}
  ${props => props.maxWidth && `max-width: ${props.maxWidth};`}
  ${props => props.maxHeight && `max-height: ${props.maxHeight};`}
  
  ${props => props.margin && `margin: ${props.margin};`}
  ${props => props.marginTop && `margin-top: ${props.marginTop};`}
  ${props => props.marginRight && `margin-right: ${props.marginRight};`}
  ${props => props.marginBottom && `margin-bottom: ${props.marginBottom};`}
  ${props => props.marginLeft && `margin-left: ${props.marginLeft};`}
  ${props => props.padding && `padding: ${props.padding};`}
  ${props => props.paddingTop && `padding-top: ${props.paddingTop};`}
  ${props => props.paddingRight && `padding-right: ${props.paddingRight};`}
  ${props => props.paddingBottom && `padding-bottom: ${props.paddingBottom};`}
  ${props => props.paddingLeft && `padding-left: ${props.paddingLeft};`}
  
  ${props => props.alignItems && `align-items: ${props.alignItems};`}
  ${props => props.alignContent && `align-content: ${props.alignContent};`}
  ${props =>
    props.justifyContent && `justify-content: ${props.justifyContent};`}
  ${props => props.flexDirection && `flex-direction: ${props.flexDirection};`}
  ${props => props.flexWrap && `flex-wrap: ${props.flexWrap};`}
  ${props => props.flex && `flex: ${props.flex};`}
  
  ${props => props.gridGap && `grid-gap: ${props.gridGap};`}
  ${props => props.gridColumnGap && `grid-column-gap: ${props.gridColumnGap};`}
  ${props => props.gridRowGap && `grid-row-gap: ${props.gridRowGap};`}
  ${props => props.gridColumn && `grid-column: ${props.gridColumn};`}
  ${props => props.gridRow && `grid-row: ${props.gridRow};`}
  
  ${props => props.position && `position: ${props.position};`}
  ${props => props.top && `top: ${props.top};`}
  ${props => props.right && `right: ${props.right};`}
  ${props => props.bottom && `bottom: ${props.bottom};`}
  ${props => props.left && `left: ${props.left};`}
  ${props => props.zIndex && `z-index: ${props.zIndex};`}
  
  ${props => props.background && `background: ${props.background};`}
  ${props =>
    props.backgroundColor && `background-color: ${props.backgroundColor};`}
  ${props =>
    props.backgroundImage && `background-image: ${props.backgroundImage};`}
  ${props =>
    props.backgroundSize && `background-size: ${props.backgroundSize};`}
  ${props =>
    props.backgroundPosition &&
    `background-position: ${props.backgroundPosition};`}
  ${props =>
    props.backgroundRepeat && `background-repeat: ${props.backgroundRepeat};`}
  ${props => props.border && `border: ${props.border};`}
  ${props => props.borderTop && `border-top: ${props.borderTop};`}
  ${props => props.borderRight && `border-right: ${props.borderRight};`}
  ${props => props.borderBottom && `border-bottom: ${props.borderBottom};`}
  ${props => props.borderLeft && `border-left: ${props.borderLeft};`}
  ${props => props.borderRadius && `border-radius: ${props.borderRadius};`}
  ${props => props.boxShadow && `box-shadow: ${props.boxShadow};`}
`;

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
  ({ as = 'div', children, className, ...props }, ref) => {
    return (
      <StyledBox as={as} ref={ref} className={className} {...props}>
        {children}
      </StyledBox>
    );
  }
);

Box.displayName = 'Box';

export default Box;
