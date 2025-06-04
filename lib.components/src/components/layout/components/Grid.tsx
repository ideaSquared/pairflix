import styled from 'styled-components';
import { Theme } from '../../../styles/theme';
import { media } from '../utils/responsive';

export interface GridProps {
	/**
	 * Number of columns or custom grid template
	 * @default 1
	 */
	columns?: number | string;

	/**
	 * Gap between grid items
	 * @default 'md'
	 */
	gap?: keyof Theme['spacing'];

	/**
	 * Vertical alignment of grid items
	 * @default 'stretch'
	 */
	alignItems?: 'start' | 'center' | 'end' | 'stretch';

	/**
	 * Horizontal alignment of grid items
	 * @default 'start'
	 */
	justifyContent?:
		| 'start'
		| 'center'
		| 'end'
		| 'space-between'
		| 'space-around'
		| 'flex-start'
		| 'flex-end';

	/**
	 * Number of columns on mobile devices
	 */
	mobileColumns?: number | string;

	/**
	 * Number of columns on tablet devices
	 */
	tabletColumns?: number | string;

	/**
	 * Number of columns on desktop devices
	 */
	desktopColumns?: number | string;

	/**
	 * Whether to auto-fit columns to available space
	 * @default false
	 */
	autoFit?: boolean;

	/**
	 * Minimum width of auto-fit columns
	 */
	minColWidth?: string;
}

export const Grid = styled.div<GridProps>`
	display: grid;
	grid-template-columns: ${({ columns = 1, autoFit, minColWidth }) =>
		autoFit && minColWidth
			? `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
			: typeof columns === 'number'
			? `repeat(${columns}, 1fr)`
			: columns};
	gap: ${({ gap = 'md', theme }) => theme.spacing[gap]};
	align-items: ${({ alignItems = 'stretch' }) => alignItems};
	justify-content: ${({ justifyContent = 'start' }) => justifyContent};

	/* Responsive grid layouts */
	@media ${media.largeDesktop} {
		grid-template-columns: ${({ desktopColumns, columns = 1 }) =>
			desktopColumns
				? typeof desktopColumns === 'number'
					? `repeat(${desktopColumns}, 1fr)`
					: desktopColumns
				: typeof columns === 'number'
				? `repeat(${columns}, 1fr)`
				: columns};
	}

	@media ${media.desktop} {
		grid-template-columns: ${({ desktopColumns, columns = 1 }) =>
			desktopColumns
				? typeof desktopColumns === 'number'
					? `repeat(${desktopColumns}, 1fr)`
					: desktopColumns
				: typeof columns === 'number'
				? `repeat(${columns}, 1fr)`
				: columns};
	}

	@media ${media.tablet} {
		grid-template-columns: ${({ tabletColumns, columns = 1 }) =>
			tabletColumns
				? typeof tabletColumns === 'number'
					? `repeat(${tabletColumns}, 1fr)`
					: tabletColumns
				: typeof columns === 'number'
				? `repeat(${Math.min(columns as number, 2)}, 1fr)`
				: columns};
	}

	@media ${media.mobile} {
		grid-template-columns: ${({ mobileColumns, autoFit, minColWidth }) =>
			mobileColumns
				? typeof mobileColumns === 'number'
					? `repeat(${mobileColumns}, 1fr)`
					: mobileColumns
				: autoFit && minColWidth
				? `repeat(auto-fit, minmax(${minColWidth}, 1fr))`
				: '1fr'};
	}
`;
