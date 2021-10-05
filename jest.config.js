module.exports = {
	projects: ['<rootDir>/packages/ovee/jest.config.js'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest'
	},
	collectCoverage: true,
	moduleFileExtensions: ['ts', 'js']
};
