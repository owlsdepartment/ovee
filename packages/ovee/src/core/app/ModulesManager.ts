import { Logger } from '@/errors';
import { isString } from '@/utils';

import { AnyModule, GetModuleInstance, GetModuleOptions, ModuleInternalInstance } from '../module';
import { App, AppManager } from './App';
import { AppConfigurator } from './AppConfigurator';

const logger = new Logger('App');

export class ModulesManager implements AppManager {
	configurator: AppConfigurator;
	modules = new Map<string, ModuleInternalInstance>();

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
		this.configurator.registeredModules.forEach(({ module, name, options = {} }) => {
			this.modules.set(name, new ModuleInternalInstance(this.app, module, options));
		});
	}

	private initModules(): void {
		this.modules.forEach(m => m.init());
	}

	private destroyModules(): void {
		this.modules.forEach(m => m.destroy());
	}

	getModule<M extends AnyModule>(
		module: M | string
	): { instance: GetModuleInstance<M>; options: GetModuleOptions<M> } {
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
			instance: foundModule.instance as GetModuleInstance<M>,
			options: foundModule.options as GetModuleOptions<M>,
		};
	}
}
