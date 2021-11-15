/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const ttypescript = require('ttypescript');

const { rollup } = require('rollup');
const commonjs = require('@rollup/plugin-commonjs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const tsPlugin = require('@rollup/plugin-typescript');
const { getBabelOutputPlugin } = require('@rollup/plugin-babel');
const { default: dts } = require('rollup-plugin-dts');

const packageNames = ['ovee', 'ovee-barba', 'ovee-content-loader'];

async function build() {
	const packageName = [...process.argv][2];
	const packagePath = path.resolve(__dirname, `../packages/${packageName}`);

	if (!packageNames.includes(packageName)) {
		throw Error(`Wrong package name! Passed: ${packageName}`);
	}

	fs.rmdirSync(path.resolve(packagePath, `dist`), { recursive: true, force: true });

	for (const format of ['es', 'cjs']) {
		const bundle = await rollup({
			external: ['ovee.js'],
			input: path.resolve(packagePath, `src/index.ts`),
			plugins: [
				commonjs(),
				nodeResolve(),
				tsPlugin({
					typescript: ttypescript,
					tsconfig: path.resolve(packagePath, `tsconfig.json`),
				}),
			],
		});

		await bundle.generate({});
		await bundle.write({
			format,

			plugins: [
				getBabelOutputPlugin({
					// A hacky way to force ES6
					presets: [['@babel/preset-env', { targets: { node: '6.10' } }]],
					plugins: [['@babel/plugin-transform-runtime', { useESModules: format === 'es' }]],
				}),
			],
			file: path.resolve(packagePath, 'dist', format === 'es' ? 'index.esm.js' : 'index.js'),
		});
		await bundle.close();
	}

	await generateDeclarationFile(packageName, packagePath);
}

async function generateDeclarationFile(packageName, packagePath) {
	const bundle = await rollup({
		input: path.resolve(packagePath, `dist/types/index.d.ts`),
		plugins: [dts()],
	});

	await bundle.generate({});
	await bundle.write({
		file: path.resolve(packagePath, `dist/index.d.ts`),
		format: 'es',
	});
	await bundle.close();

	fs.rmdirSync(path.resolve(packagePath, `dist/types`), {
		recursive: true,
	});
}

build();
