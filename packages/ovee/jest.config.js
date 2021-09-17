module.exports = {
	preset: '../../jest-preset.js',
	roots: ['<rootDir>/tests'],
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tests/tsconfig.json',
		},
	},
	setupFiles: ['./tests/helpers/_helpers.ts'],
};
