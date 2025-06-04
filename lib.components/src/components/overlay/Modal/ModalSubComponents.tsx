import React from 'react';
import styled from 'styled-components';
import { BaseComponentProps } from '../../../types';

/**
 * Props for ModalBody component
 */
export interface ModalBodyProps extends BaseComponentProps {
	/**
	 * The content to be rendered inside the modal body
	 */
	children: React.ReactNode;

	/**
	 * Whether to remove default padding
	 * @default false
	 */
	noPadding?: boolean;
}

/**
 * Props for ModalFooter component
 */
export interface ModalFooterProps extends BaseComponentProps {
	/**
	 * The content to be rendered inside the modal footer
	 */
	children: React.ReactNode;

	/**
	 * Whether to align buttons/content to the start
	 * @default 'end'
	 */
	justifyContent?: 'start' | 'center' | 'end' | 'space-between';

	/**
	 * Whether to use divider above footer
	 * @default true
	 */
	withDivider?: boolean;
}

export const ModalBody = styled.div<{ $noPadding?: boolean }>`
	flex: 1;
	margin-bottom: ${({ theme, $noPadding }) =>
		$noPadding ? '0' : theme?.spacing?.md || '1rem'};
	padding: ${({ $noPadding }) => ($noPadding ? '0' : undefined)};
	overflow-y: auto;
`;

export const ModalFooter = styled.div<{
	$justifyContent?: string;
	$withDivider?: boolean;
}>`
	display: flex;
	justify-content: ${({ $justifyContent }) => $justifyContent || 'flex-end'};
	gap: ${({ theme }) => theme?.spacing?.md || '1rem'};
	margin-top: ${({ theme }) => theme?.spacing?.lg || '1.5rem'};
	${({ $withDivider, theme }) =>
		$withDivider &&
		`
    border-top: 1px solid ${theme?.colors?.border?.default || '#e0e0e0'};
    padding-top: ${theme?.spacing?.md || '1rem'};
  `}

	/* Stack buttons on mobile */
  @media (max-width: ${({ theme }) => theme?.breakpoints?.sm || '576px'}) {
		flex-direction: column;
		gap: ${({ theme }) => theme?.spacing?.sm || '0.5rem'};
	}
`;

/**
 * ModalBody component for standardized content area in Modal
 */
export const StyledModalBody: React.FC<ModalBodyProps> = ({
	children,
	noPadding,
	className,
	...rest
}) => {
	return (
		<ModalBody $noPadding={noPadding} className={className} {...rest}>
			{children}
		</ModalBody>
	);
};

/**
 * ModalFooter component for standardized actions area in Modal
 */
export const StyledModalFooter: React.FC<ModalFooterProps> = ({
	children,
	justifyContent = 'end',
	withDivider = true,
	className,
	...rest
}) => {
	return (
		<ModalFooter
			$justifyContent={justifyContent}
			$withDivider={withDivider}
			className={className}
			{...rest}
		>
			{children}
		</ModalFooter>
	);
};
