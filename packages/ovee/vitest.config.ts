import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		allowOnly: true,
		environment: 'happy-dom',
		alias: {
			'~': __dirname,
			'@': path.resolve(__dirname, 'src'),
			'#': path.resolve(__dirname, 'tests'),
		},
		root: __dirname,
		include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		typecheck: {
			include: ['tests/**/*.{test,spec}.{ts,mts,cts,tsx}'],
			checker: 'tsc',
			ignoreSourceErrors: true,
			tsconfig: './tests/tsconfig.json',
		},
	},
});
