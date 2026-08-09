import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'shared',
        'ui',
        'supabase',
        'config',
        'storefront',
        'admin',
        'functions',
        'docs',
        'deps',
        'infra',
      ],
    ],
  },
};

export default config;
