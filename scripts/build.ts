import fs from 'fs';
import path from 'path';

import { generateDtsFile, generateJsFile } from './helpers';

// maybe it should be infered from package.json 'dependency' field
const external = ['ovee.js', 'lit-html', 'reflect-metadata', /^@vue\//, '@barba/core'];
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

	const input = path.resolve(packagePath, `src/index.ts`);

	for (const format of ['es', 'cjs'] as const) {
		const outputName = format === 'es' ? 'index.mjs' : 'index.cjs';

		await generateJsFile(packagePath, { input, external }, format, outputName);
	}

	console.log(`[BUILD] Generating typings...`);

	await generateDtsFile(packagePath, { input, external }, 'index');

	console.log(`[BUILD] Package '${packageName}' build!`);

	if (packageName === 'ovee') buildJSXRuntime(packagePath);
}

async function buildJSXRuntime(packagePath: string) {
	console.log(`[BUILD] Building JSX runtime...`);

	const input = path.resolve(packagePath, `src/jsx-runtime.ts`);

	await generateJsFile(packagePath, { input }, 'es', 'jsx-runtime.js');

	console.log(`[BUILD] Generating JSX typings...`);

	await generateDtsFile(packagePath, { input }, 'jsx-runtime');

	console.log(`[BUILD] Jsx runtime package build!`);
}

build();
