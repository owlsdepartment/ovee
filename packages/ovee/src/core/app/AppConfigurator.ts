import { Logger } from '@/errors';
import { isComponentDefinition, isModuleDefinition, isNil } from '@/utils';

import { Component, ComponentOptions } from '../defineComponent';
import { Module, ModuleOptions } from '../defineModule';
import { App } from './App';
import { AppConfig } from './createApp';

export interface ComponentRegistration<O extends ComponentOptions = ComponentOptions> {
	name: string;
	component: Component<HTMLElement, O>;
	options?: O;
}

export interface ModuleRegistration<O extends ModuleOptions = ModuleOptions> {
	name: string;
	module: Module<O>;
	options?: O;
}

const logger = new Logger('createApp');

export class AppConfigurator {
	registeredModules: Map<string, ModuleRegistration> = new Map();
	registeredComponents: Map<string, ComponentRegistration> = new Map();

	get config() {
		return this._config;
	}

	get document() {
		return this._config.document ?? document;
	}

	constructor(protected _config: Partial<AppConfig>) {}

	updateConfig(newConfig: Partial<AppConfig>): this {
		this._config = {
			...this._config,
			...newConfig,
		};

		return this;
	}

	run(root: HTMLElement) {
		const app = new App(this, root);
		const run = () => app.run();

		if (this.document.readyState === 'loading') {
			this.document.addEventListener('DOMContentLoaded', run, { once: true });
		} else {
			run();
		}

		return app;
	}

	use<Options extends ModuleOptions>(
		name: string,
		module: Module<Options>,
		options?: Options
	): this {
		if (!this.validateModule(name, module)) return this;

		if (!this.validateOptions(name, options)) {
			options = undefined;
		}

		this.registeredModules.set(name, { name, module, options } as ModuleRegistration);

		return this;
	}

	useMany(modules: Record<string, Module | [Module] | [Module, ModuleOptions | undefined]>): this {
		for (const [name, value] of Object.entries(modules)) {
			const [module, options] = Array.isArray(value) ? value : [value];

			this.use(name, module, options);
		}

		return this;
	}

	private validateModule(name: string, module: any): boolean {
		if (!isModuleDefinition(module)) {
			logger.warn(
				`Received value that is not a module definition under name '${name}', skipping. Did you used 'defineModule'?`
			);

			return false;
		}

		return true;
	}

	component<Options extends ComponentOptions>(
		name: string,
		component: Component<HTMLElement, Options>,
		options?: Options
	): this {
		if (!this.validateComponent(name, component)) return this;

		if (!this.validateOptions(name, options)) {
			options = undefined;
		}

		this.registeredComponents.set(name, { name, component, options } as ComponentRegistration);

		return this;
	}

	components(
		components: Record<string, Component | [Component, ComponentOptions | undefined]>
	): this {
		for (const [name, value] of Object.entries(components)) {
			const [component, options] = Array.isArray(value) ? value : [value];

			this.component(name, component, options);
		}

		return this;
	}

	private validateComponent(name: string, component: any): boolean {
		if (!isComponentDefinition(component)) {
			logger.warn(
				`Received value that is not a component definition under name '${name}', skipping. Did you used 'defineComponent'?`
			);

			return false;
		}

		return true;
	}

	private validateOptions(name: string, options: any): boolean {
		if (isNil(options)) return true;

		if (typeof options !== 'object' || Array.isArray(options)) {
			logger.warn(`Received wrong options type under name '${name}', ignoring.`);

			return false;
		}

		return true;
	}
}
