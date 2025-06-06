import React, {
	forwardRef,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import styled, { css, keyframes } from 'styled-components';
import { BaseComponentProps } from '../../../types';

export type TooltipPlacement =
	| 'top'
	| 'top-start'
	| 'top-end'
	| 'bottom'
	| 'bottom-start'
	| 'bottom-end'
	| 'left'
	| 'left-start'
	| 'left-end'
	| 'right'
	| 'right-start'
	| 'right-end';

export type TooltipTrigger = 'hover' | 'click' | 'focus';

export interface TooltipProps extends BaseComponentProps {
	/**
	 * The content to display in the tooltip
	 */
	content: React.ReactNode;

	/**
	 * The element that triggers the tooltip
	 */
	children: React.ReactElement;

	/**
	 * The placement of the tooltip relative to the trigger
	 * @default 'top'
	 */
	placement?: TooltipPlacement;

	/**
	 * The events that trigger the tooltip
	 * @default ['hover', 'focus']
	 */
	trigger?: TooltipTrigger[];

	/**
	 * Delay before showing tooltip (ms)
	 * @default 200
	 */
	showDelay?: number;

	/**
	 * Delay before hiding tooltip (ms)
	 * @default 0
	 */
	hideDelay?: number;

	/**
	 * Whether to show an arrow pointing to the trigger
	 * @default true
	 */
	arrow?: boolean;

	/**
	 * Maximum width of the tooltip
	 * @default '200px'
	 */
	maxWidth?: string;

	/**
	 * Whether tooltip is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Whether tooltip is visible (controlled)
	 */
	visible?: boolean;

	/**
	 * Callback when tooltip visibility changes
	 */
	onVisibleChange?: (visible: boolean) => void;

	/**
	 * Custom offset from the trigger element
	 * @default 8
	 */
	offset?: number;

	/**
	 * Whether to animate the tooltip
	 * @default true
	 */
	animate?: boolean;
}

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
`;

interface StyledTooltipProps {
	$placement: TooltipPlacement;
	$offset: number;
	$maxWidth: string;
	$animate?: boolean;
	$visible?: boolean;
}

const getPlacementStyles = (placement: TooltipPlacement, offset: number) => {
	const placements = {
		top: css`
			bottom: calc(100% + ${offset}px);
			left: 50%;
			transform: translateX(-50%);
		`,
		'top-start': css`
			bottom: calc(100% + ${offset}px);
			left: 0;
		`,
		'top-end': css`
			bottom: calc(100% + ${offset}px);
			right: 0;
		`,
		bottom: css`
			top: calc(100% + ${offset}px);
			left: 50%;
			transform: translateX(-50%);
		`,
		'bottom-start': css`
			top: calc(100% + ${offset}px);
			left: 0;
		`,
		'bottom-end': css`
			top: calc(100% + ${offset}px);
			right: 0;
		`,
		left: css`
			right: calc(100% + ${offset}px);
			top: 50%;
			transform: translateY(-50%);
		`,
		'left-start': css`
			right: calc(100% + ${offset}px);
			top: 0;
		`,
		'left-end': css`
			right: calc(100% + ${offset}px);
			bottom: 0;
		`,
		right: css`
			left: calc(100% + ${offset}px);
			top: 50%;
			transform: translateY(-50%);
		`,
		'right-start': css`
			left: calc(100% + ${offset}px);
			top: 0;
		`,
		'right-end': css`
			left: calc(100% + ${offset}px);
			bottom: 0;
		`,
	};
	return placements[placement];
};

const StyledTooltip = styled.div<StyledTooltipProps>`
	position: absolute;
	z-index: 1000;
	max-width: ${({ $maxWidth }) => $maxWidth};
	padding: ${({ theme }) => theme?.spacing?.xs || '4px'}
		${({ theme }) => theme?.spacing?.sm || '8px'};
	background: ${({ theme }) => theme?.colors?.text?.primary || '#000000'};
	color: ${({ theme }) => theme?.colors?.text?.onPrimary || '#ffffff'};
	border-radius: ${({ theme }) => theme?.borderRadius?.sm || '4px'};
	font-size: ${({ theme }) => theme?.typography?.fontSize?.sm || '14px'};
	line-height: 1.4;
	white-space: pre-wrap;
	pointer-events: none;
	opacity: ${({ $visible }) => ($visible ? 1 : 0)};
	visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
	animation: ${({ $animate }) =>
		$animate
			? css`
					${fadeIn} 0.2s ease-out
			  `
			: 'none'};

	${({ $placement, $offset }) => getPlacementStyles($placement, $offset)}
`;

const TooltipArrow = styled.div<{ $placement: TooltipPlacement }>`
	position: absolute;
	width: 8px;
	height: 8px;
	background: inherit;
	transform: rotate(45deg);

	${({ $placement }) => {
		switch ($placement) {
			case 'top':
			case 'top-start':
			case 'top-end':
				return css`
					bottom: -4px;
					left: 50%;
					margin-left: -4px;
				`;
			case 'bottom':
			case 'bottom-start':
			case 'bottom-end':
				return css`
					top: -4px;
					left: 50%;
					margin-left: -4px;
				`;
			case 'left':
			case 'left-start':
			case 'left-end':
				return css`
					right: -4px;
					top: 50%;
					margin-top: -4px;
				`;
			case 'right':
			case 'right-start':
			case 'right-end':
				return css`
					left: -4px;
					top: 50%;
					margin-top: -4px;
				`;
			default:
				return '';
		}
	}}
`;

const TooltipTrigger = styled.div`
	display: inline-block;
	position: relative;
`;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
	(
		{
			content,
			children,
			placement = 'top',
			trigger = ['hover', 'focus'],
			showDelay = 200,
			hideDelay = 0,
			arrow = true,
			maxWidth = '200px',
			disabled = false,
			visible: controlledVisible,
			onVisibleChange,
			offset = 8,
			animate = true,
			className,
			...rest
		},
		ref
	) => {
		const [isVisible, setIsVisible] = useState(false);
		const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
		const triggerRef = useRef<HTMLDivElement>(null);
		const showTimeoutRef = useRef<NodeJS.Timeout>();
		const hideTimeoutRef = useRef<NodeJS.Timeout>();

		const handleShowTooltip = useCallback(() => {
			clearTimeout(hideTimeoutRef.current);
			if (!disabled) {
				showTimeoutRef.current = setTimeout(() => {
					setIsVisible(true);
					onVisibleChange?.(true);
				}, showDelay);
			}
		}, [disabled, showDelay, onVisibleChange]);

		const handleHideTooltip = useCallback(() => {
			clearTimeout(showTimeoutRef.current);
			hideTimeoutRef.current = setTimeout(() => {
				setIsVisible(false);
				onVisibleChange?.(false);
			}, hideDelay);
		}, [hideDelay, onVisibleChange]);

		useEffect(() => {
			return () => {
				clearTimeout(showTimeoutRef.current);
				clearTimeout(hideTimeoutRef.current);
			};
		}, []);

		useEffect(() => {
			if (controlledVisible !== undefined) {
				setIsVisible(controlledVisible);
			}
		}, [controlledVisible]);

		const eventHandlers = trigger.reduce((handlers, triggerType) => {
			switch (triggerType) {
				case 'hover':
					return {
						...handlers,
						onMouseEnter: handleShowTooltip,
						onMouseLeave: handleHideTooltip,
					};
				case 'focus':
					return {
						...handlers,
						onFocus: handleShowTooltip,
						onBlur: handleHideTooltip,
					};
				case 'click':
					return {
						...handlers,
						onClick: () => {
							if (isVisible) {
								handleHideTooltip();
							} else {
								handleShowTooltip();
							}
						},
					};
				default:
					return handlers;
			}
		}, {});

		const visible =
			controlledVisible !== undefined ? controlledVisible : isVisible;

		// For testing purposes, find a parent element or create one
		const portalContainer =
			typeof document !== 'undefined' ? document.body : null;

		if (!portalContainer) {
			return (
				<TooltipTrigger ref={triggerRef} {...eventHandlers}>
					{children}
				</TooltipTrigger>
			);
		}

		return (
			<>
				<TooltipTrigger ref={triggerRef} {...eventHandlers}>
					{children}
				</TooltipTrigger>
				{createPortal(
					<StyledTooltip
						ref={ref}
						$placement={placement}
						$offset={offset}
						$maxWidth={maxWidth}
						$animate={animate}
						$visible={visible}
						className={className}
						role='tooltip'
						aria-hidden={!visible}
						{...rest}
					>
						{content}
						{arrow && <TooltipArrow $placement={placement} />}
					</StyledTooltip>,
					portalContainer
				)}
			</>
		);
	}
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
