import styled, { css } from 'styled-components';
import { Theme } from '../../../styles/theme';
import { media } from '../utils/responsive';

export interface FlexProps {
	/**
	 * Flex direction
	 * @default 'row'
	 */
	direction?: 'row' | 'column';

	/**
	 * Gap between flex items
	 * @default 'md'
	 */
	gap?: keyof Theme['spacing'];

	/**
	 * Cross-axis alignment of flex items
	 * @default 'stretch'
	 */
	alignItems?:
		| 'start'
		| 'center'
		| 'end'
		| 'stretch'
		| 'flex-start'
		| 'flex-end'
		| 'baseline';

	/**
	 * Main-axis alignment of flex items
	 * @default 'start'
	 */
	justifyContent?:
		| 'start'
		| 'center'
		| 'end'
		| 'space-between'
		| 'space-around'
		| 'space-evenly'
		| 'flex-start'
		| 'flex-end';

	/**
	 * Wrapping behavior
	 * @default 'nowrap'
	 */
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';

	/**
	 * Direction on mobile devices
	 */
	mobileDirection?: 'row' | 'column';

	/**
	 * Direction on tablet devices
	 */
	tabletDirection?: 'row' | 'column';

	/**
	 * Gap between items on mobile
	 */
	mobileGap?: keyof Theme['spacing'];

	/**
	 * Whether to take full width
	 * @default false
	 */
	fullWidth?: boolean;

	/**
	 * Whether to take full height
	 * @default false
	 */
	fullHeight?: boolean;

	/**
	 * CSS flex property
	 */
	flex?: string;

	/**
	 * CSS flex-grow property
	 */
	grow?: number;

	/**
	 * CSS flex-shrink property
	 */
	shrink?: number;

	/**
	 * CSS flex-basis property
	 */
	basis?: string;

	/**
	 * Whether to center items both horizontally and vertically
	 * @default false
	 */
	center?: boolean;

	/**
	 * Whether to reverse the direction
	 * @default false
	 */
	reverse?: boolean;

	/**
	 * Inline flex display
	 * @default false
	 */
	inline?: boolean;
}

export const Flex = styled.div<FlexProps>`
	display: ${({ inline }) => (inline ? 'inline-flex' : 'flex')};
	flex-direction: ${({ direction = 'row', reverse }) =>
		direction === 'row'
			? reverse
				? 'row-reverse'
				: 'row'
			: reverse
			? 'column-reverse'
			: 'column'};
	gap: ${({ gap = 'md', theme }) => theme.spacing[gap]};
	align-items: ${({ alignItems = 'stretch', center }) =>
		center ? 'center' : alignItems};
	justify-content: ${({ justifyContent = 'start', center }) =>
		center ? 'center' : justifyContent};
	flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
	width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
	height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};
	flex: ${({ flex }) => flex};
	flex-grow: ${({ grow }) => grow};
	flex-shrink: ${({ shrink }) => shrink};
	flex-basis: ${({ basis }) => basis};

	/* Responsive adjustments */
	@media ${media.tablet} {
		flex-direction: ${({ tabletDirection, direction = 'row', reverse }) =>
			tabletDirection
				? reverse
					? `${tabletDirection}-reverse`
					: tabletDirection
				: direction === 'row'
				? reverse
					? 'row-reverse'
					: 'row'
				: reverse
				? 'column-reverse'
				: 'column'};
	}

	@media ${media.mobile} {
		flex-direction: ${({ mobileDirection, direction = 'row', reverse }) =>
			mobileDirection
				? reverse
					? `${mobileDirection}-reverse`
					: mobileDirection
				: direction === 'row'
				? 'column'
				: direction};
		gap: ${({ mobileGap, gap = 'md', theme }) =>
			theme.spacing[mobileGap || (gap === 'lg' || gap === 'xl' ? 'md' : gap)]};

		/* Common pattern: Row on desktop becomes column on mobile */
		${({ direction, mobileDirection }) =>
			(direction === 'row' || mobileDirection === 'column') &&
			css`
				& > * {
					width: 100%;
				}
			`}
	}
`;
