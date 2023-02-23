import fs from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

const packageNames = ['ovee', 'ovee-barba', 'ovee-content-loader'];

async function build() {
	const packageName = [...process.argv][2];
	const packagePath = path.resolve(__dirname, `../packages/${packageName}`);

	if (!packageNames.includes(packageName)) {
		throw Error(`Wrong package name! Passed: ${packageName}`);
	}

	// if cwd is wrong, imports resolutions are wrong
	process.chdir(packagePath);
	fs.rmSync(path.resolve(packagePath, `dist`), { recursive: true, force: true });

	console.log(`[BUILD] Building package '${packageName}'...`);

	for (const format of ['es', 'cjs'] as const) {
		const { input, tsconfig, external } = getBundleConfig(packagePath);

		const bundle = await rollup({
			external,
			input,

			plugins: [
				typescriptPaths({
					tsConfigPath: tsconfig,
					preserveExtensions: true,
				}),
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

	console.log(`[BUILD] Generating typings...`);

	await generateDeclarationFile(packagePath);

	console.log(`[BUILD] Package '${packageName}' build!`);
}

async function generateDeclarationFile(packagePath: string) {
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

function getBundleConfig(packagePath: string) {
	return {
		input: path.resolve(packagePath, `src/index.ts`),
		tsconfig: path.resolve(packagePath, `tsconfig.json`),
		// it should be infered from package.json 'dependency' field
		external: ['ovee.js', 'lit-html', 'reflect-metadata', /^@vue\//, '@barba/core'],
	};
}

build();
