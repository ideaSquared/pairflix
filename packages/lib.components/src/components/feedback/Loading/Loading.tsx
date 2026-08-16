import clsx from 'clsx';
import React, { forwardRef } from 'react';
import { Typography } from '../../../components/utility/Typography/Typography';
import type { BaseComponentProps } from '../../../types';
import { Flex } from '../../layout';
import { vars } from '../../../styles/theme.css';
import {
  fullScreenContainer,
  loadingContainer,
  loadingMessage,
  spinner,
} from './Loading.css';

export interface SpinnerProps extends BaseComponentProps {
  /**
   * Size of the spinner in pixels
   * @default 40
   */
  size?: number;

  /**
   * Thickness of the spinner border in pixels
   * @default 3
   */
  thickness?: number;

  /**
   * Custom color for the spinner
   * If not provided, uses theme.colors.primary
   */
  color?: string;

  /**
   * Custom track color for the spinner
   * If not provided, uses theme.colors.background.secondary
   */
  trackColor?: string;

  /**
   * Speed of the rotation animation in seconds
   * @default 1
   */
  speed?: number;
}

export const LoadingSpinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 40,
      thickness = 3,
      color,
      trackColor,
      speed = 1,
      className,
      style,
      ...rest
    },
    ref
  ) => (
    <div
      ref={ref}
      className={clsx(spinner, className)}
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderColor: trackColor || vars.colors.background.secondary,
        borderTopColor: color || vars.colors.primary,
        animationDuration: `${speed}s`,
        ...style,
      }}
      {...rest}
    />
  )
);
LoadingSpinner.displayName = 'LoadingSpinner';

export interface LoadingProps extends BaseComponentProps {
  /**
   * Size of the spinner in pixels
   * @default 40
   */
  size?: number;

  /**
   * Loading message to display
   * @default 'Loading...'
   */
  message?: string;

  /**
   * Whether to show in fullscreen mode
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Props to pass to the spinner component
   */
  spinnerProps?: Omit<SpinnerProps, 'size'>;

  /**
   * Additional content to render below the spinner
   */
  children?: React.ReactNode;
}

/**
 * Loading component for displaying loading states with spinner and optional message
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 40,
  message = 'Loading...',
  fullScreen = false,
  spinnerProps,
  children,
  className,
}) => {
  const content = (
    <Flex
      direction="column"
      gap="md"
      alignItems="center"
      justifyContent="center"
      className={clsx(loadingContainer, className)}
    >
      <LoadingSpinner size={size} {...spinnerProps} />
      {message && (
        <Typography
          variant="body2"
          color="secondary"
          className={loadingMessage}
        >
          {message}
        </Typography>
      )}
      {children}
    </Flex>
  );

  return fullScreen ? (
    <div
      className={fullScreenContainer}
      role="progressbar"
      aria-busy="true"
      aria-label={message}
    >
      {content}
    </div>
  ) : (
    <div role="progressbar" aria-busy="true" aria-label={message}>
      {content}
    </div>
  );
};

export interface InlineLoadingProps extends SpinnerProps {
  /**
   * Message to display next to the spinner
   * @default 'Loading...'
   */
  message?: string;
}

/**
 * InlineLoading component for use within text or small spaces
 */
export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 20,
  message = 'Loading...',
  ...props
}) => (
  <Flex
    alignItems="center"
    gap="xs"
    role="progressbar"
    aria-busy="true"
    aria-label={message}
  >
    <LoadingSpinner size={size} {...props} />
    <Typography variant="caption">{message}</Typography>
  </Flex>
);

/**
 * ButtonLoading component for use within buttons
 */
export const ButtonLoading: React.FC<SpinnerProps> = ({
  size = 16,
  ...props
}) => <LoadingSpinner size={size} {...props} />;

export default Loading;
