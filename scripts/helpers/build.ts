import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { ModuleFormat, rollup, RollupOptions } from 'rollup';
import dts from 'rollup-plugin-dts';
// import esbuild from 'rollup-plugin-esbuild';
// import { typescriptPaths } from 'rollup-plugin-typescript-paths';

export async function generateJsFile(
	packagePath: string,
	options: RollupOptions,
	format: ModuleFormat,
	outputFile: string
) {
	const tsconfig = path.resolve(packagePath, `tsconfig.json`);

	const bundle = await rollup({
		...options,

		plugins: [
			// typescriptPaths({
			// 	tsConfigPath: tsconfig,
			// 	preserveExtensions: true,
			// }),
			// esbuild({ tsconfig }),
			typescript({ tsconfig }),
		],
	});

	await bundle.generate({});
	await bundle.write({
		format,

		file: path.resolve(packagePath, 'dist', outputFile),
	});
	await bundle.close();
}

export async function generateDtsFile(
	packagePath: string,
	options: RollupOptions,
	outputFile: string
) {
	const tsconfig = path.resolve(packagePath, `tsconfig.json`);
	const bundle = await rollup({
		...options,

		plugins: [
			// typescriptPaths({
			// 	tsConfigPath: tsconfig,
			// 	preserveExtensions: true,
			// }),
			typescript({ tsconfig }),
			dts(),
		],
	});

	await bundle.generate({});
	await bundle.write({
		format: 'es',
		file: path.resolve(packagePath, `dist`, `${outputFile}.d.ts`),
	});
	await bundle.close();
}
