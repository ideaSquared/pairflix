import baseConfig from '@pairflix/eslint-config-base';
import pluginReact from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * React ESLint flat config for the Pairflix apps and lib.components, ported
 * from the creatorgrid sibling repo's eslint-config-react. Keeps jsx-a11y
 * (pairflix's pre-existing accessibility linting) in addition to creatorgrid's
 * rule set.
 */
export default [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    settings: { react: { version: '19.0' } },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/no-danger': 'error',
      // 'warn' rather than creatorgrid's 'error': pairflix is retrofitting this rule onto an
      // existing codebase, and it surfaces a large pre-existing backlog of decorative inline
      // styles in Storybook-only .stories.tsx files. Newly-introduced violations in real
      // component code should still be fixed on sight; promote to 'error' once the backlog
      // is cleared.
      'react/forbid-component-props': [
        'warn',
        {
          forbid: [
            {
              propName: 'style',
              message:
                'Use a vanilla-extract class instead of an inline style.',
            },
          ],
        },
      ],
    },
  },
];
