// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**'],
  },

  eslint.configs.recommended,

  // TypeScript OK MAIS PAS ULTRA-STRICT
  ...tseslint.configs.recommended,

  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      //  Désactivation des règles qui te cassent tout
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      '@typescript-eslint/require-await': 'off',

      // Bruit inutile
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],

      '@typescript-eslint/no-floating-promises': 'off',

      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
