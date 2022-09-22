/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

const { rollup } = require('rollup');
const { default: dts } = require('rollup-plugin-dts');
const { typescriptPaths } = require('rollup-plugin-typescript-paths');
const { default: esbuild } = require('rollup-plugin-esbuild');

const packageNames = ['ovee', 'ovee-barba', 'ovee-content-loader'];

async function build() {
	const packageName = [...process.argv][2];
	const packagePath = path.resolve(__dirname, `../packages/${packageName}`);

	if (!packageNames.includes(packageName)) {
		throw Error(`Wrong package name! Passed: ${packageName}`);
	}

	fs.rmSync(path.resolve(packagePath, `dist`), { recursive: true, force: true });

	for (const format of ['es', 'cjs']) {
		const { input, tsconfig, external } = getBundleConfig(packagePath);

		const bundle = await rollup({
			external,
			input,

			plugins: [
				typescriptPaths({
					tsConfigPath: tsconfig,
					preserveExtensions: true,
				}),
				// nodeResolve({}),
				esbuild({ target: 'es2020', tsconfig }),
			],
		});

		await bundle.generate({});
		await bundle.write({
			format,

			file: path.resolve(packagePath, 'dist', format === 'es' ? 'index.mjs' : 'index.cjs'),
		});
		await bundle.close();
	}

	await generateDeclarationFile(packagePath);
}

async function generateDeclarationFile(packagePath) {
	const { input, external, tsconfig } = getBundleConfig(packagePath);
	const bundle = await rollup({
		input,
		external,

		plugins: [
			typescriptPaths({
				tsConfigPath: tsconfig,
				preserveExtensions: true,
			}),
			dts(),
		],
	});

	await bundle.generate({});
	await bundle.write({
		file: path.resolve(packagePath, `dist/index.d.ts`),
		format: 'es',
	});
	await bundle.close();
}

function getBundleConfig(packagePath) {
	return {
		input: path.resolve(packagePath, `src/index.ts`),
		tsconfig: path.resolve(packagePath, `tsconfig.json`),
		// it should be infered from package.json 'dependency' field
		external: ['ovee.js', 'lit-html', 'reflect-metadata', /^@vue\//, '@barba/core'],
	};
}

build();
