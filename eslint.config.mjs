import js from '@eslint/js';
import ts from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const workspacesWithReact = [
  'apps/storefront',
  'apps/admin',
  'packages/ui',
  'packages/auth',
  'packages/cart',
  'packages/category',
  'packages/order',
  'packages/product',
];

export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.turbo/**', '**/.next/**', '**/coverage/**', '**/.vite/**'] },

  js.configs.recommended,

  ...ts.configs.recommended,
  ...ts.configs.strict,

  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    languageOptions: { globals: { ...globals.browser, ...globals.es2022 } },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'separate-type-imports' }],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      'no-empty': 'warn',
    },
  },

  {
    plugins: { 'simple-import-sort': simpleImportSortPlugin },
    rules: { 'simple-import-sort/imports': 'error', 'simple-import-sort/exports': 'error' },
  },

  {
    files: workspacesWithReact.flatMap((ws) => [`${ws}/src/**/*.{ts,tsx}`]),
    plugins: { react: reactPlugin, 'react-hooks': reactHooksPlugin, 'react-refresh': reactRefreshPlugin },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    settings: { react: { version: 'detect' } },
  },

  {
    files: ['functions/src/**/*.ts', 'scripts/**/*.{ts,mjs}', '*.config.{ts,mjs,js}', '**/*.config.{ts,mjs,js}'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-console': 'off', '@typescript-eslint/no-require-imports': 'off' },
  },

  eslintConfigPrettier,
];
