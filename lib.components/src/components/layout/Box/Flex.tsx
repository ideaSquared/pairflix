import styled from 'styled-components';
import type { BoxProps } from './Box';
import { Box } from './Box';

export interface FlexProps extends BoxProps {
	inline?: boolean;
	direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
	flow?: string;
	justifyContent?:
		| 'flex-start'
		| 'flex-end'
		| 'center'
		| 'space-between'
		| 'space-around'
		| 'space-evenly';
	alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
	alignContent?:
		| 'flex-start'
		| 'flex-end'
		| 'center'
		| 'space-between'
		| 'space-around'
		| 'stretch';
	gap?: string;
}

export const Flex = styled(Box).attrs<FlexProps>((props) => ({
	display: props.inline ? 'inline-flex' : 'flex',
	flexDirection: props.direction,
	flexWrap: props.wrap,
	flexFlow: props.flow,
	justifyContent: props.justifyContent,
	alignItems: props.alignItems,
	alignContent: props.alignContent,
	gap: props.gap,
}))<FlexProps>``;

export default Flex;
