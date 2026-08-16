import clsx from 'clsx';
import React from 'react';
import {
  darkThemeClass,
  lightThemeClass,
  themeRoot,
} from '../src/styles/theme.css';
import { previewPadding } from './preview.css';

export const GlobalThemeDecorator = (Story, context) => {
  // Get theme from Storybook toolbar selection
  const { globals } = context;
  const selectedTheme = globals.theme || 'light';

  // Select proper theme class
  const themeClass =
    selectedTheme === 'dark' ? darkThemeClass : lightThemeClass;

  return (
    <div className={clsx(themeClass, themeRoot)}>
      <div className={previewPadding}>
        <Story />
      </div>
    </div>
  );
};
