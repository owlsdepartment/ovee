module.exports = {
	verbose: true,
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	globals: {
		'ts-jest': {
			diagnostics: false,
			babelConfig: {
				plugins: ['@babel/plugin-proposal-class-properties'],
			},
		},
	},
	testMatch: ['**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'],
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.{js,ts}'],
	coveragePathIgnorePatterns: ['tests/helpers'],
	moduleFileExtensions: ['ts', 'js'],
	moduleDirectories: ['node_modules', 'src'],
	moduleNameMapper: {
		'^src/(.*)$': '<rootDir>/src/$1',
		'^tests/(.*)$': '<rootDir>/tests/$1',
	},
};
