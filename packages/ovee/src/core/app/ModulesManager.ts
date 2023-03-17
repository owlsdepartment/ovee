import { Logger } from '@/errors';
import { isString } from '@/utils';

import { CreatedModule, createModule } from '../createModule';
import { GetModuleInstance, GetModuleOptions, Module } from '../defineModule';
import { App, AppManager } from './App';
import { AppConfigurator } from './AppConfigurator';

const logger = new Logger('App');

export class ModulesManager implements AppManager {
	configurator: AppConfigurator;
	modules = new Map<string, CreatedModule>();

	constructor(public app: App) {
		this.configurator = app.configurator;

		this.createModules();
	}

	run() {
		this.initModules();
	}

	destroy() {
		this.destroyModules();
	}

	private createModules(): void {
		this.configurator.registeredModules.forEach(({ module, name, options }) => {
			this.modules.set(name, createModule(module, options));
		});
	}

	private initModules(): void {
		this.modules.forEach(m => m.init());
	}

	private destroyModules(): void {
		this.modules.forEach(m => m.destroy());
	}

	getModule<M extends Module, Instance = GetModuleInstance<M>, Options = GetModuleOptions<M>>(
		module: M | string
	): { instance: Instance; options: Options } {
		let name = '';

		if (isString(module)) {
			name = module;
		} else {
			[name] = Array.from(this.configurator.registeredModules.entries()).find(
				([, m]) => m.module === module
			) ?? [''];
		}

		if (!name) {
			throw new Error(
				logger.getMessage(`Couldn't find this module. Did you regitered it properly?`)
			);
		}

		const foundModule = this.modules.get(name);

		if (!foundModule) {
			throw new Error(logger.getMessage(`Module '${name}' is not registered`));
		}

		return {
			instance: foundModule.instance as Instance,
			options: foundModule.options as Options,
		};
	}
}
