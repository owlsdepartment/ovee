import { App, createApp, Module, ModuleInternalInstance, ModuleOptions } from '@/core';

interface Config {
	app?: App;
	options?: ModuleOptions;
}

export function createModule(
	module: Module,
	{ app, options = {} }: Config = {},
	initInitially = true
) {
	if (!app) {
		const appConfig = createApp();

		app = new App(appConfig, document.body);
	}

	const instance = new ModuleInternalInstance(app, module, options);

	if (initInitially) instance.init();

	return instance;
}
