module.exports = {
    verbose: true,
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    },
    testMatch: [
        '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,ts}'
    ],
    moduleFileExtensions: [
        'ts',
        'js'
    ],
    moduleDirectories: [
        'node_modules',
        'src'
    ],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '^tests/(.*)$': '<rootDir>/tests/$1'
    }
};
