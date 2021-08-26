module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
		es6: true
	},
	ignorePatterns: ['**/dist/*'],

	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020
	},

	plugins: ['@typescript-eslint', 'simple-import-sort', 'lit'],

	extends: [
		'eslint:recommended',
		'plugin:lit/recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended'
	],

	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],

		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],

		'simple-import-sort/imports': [
			'warn',
			{
				groups: [['^\\u0000'], ['^@?\\w'], ['^', '^@pdf\\/'], ['^\\.\\.?\\/']]
			}
		],
		'simple-import-sort/exports': 'warn'
	}
};
