import { EventBus, OmitNil, runThrowable } from '@/utils';

import { App } from '../app';
import { Module } from './defineModule';
import { ModuleInternalContext, provideModuleContext } from './moduleContext';
import { ModuleOptions, ModuleReturn } from './types';

export class ModuleInternalInstance<
	Options extends ModuleOptions = ModuleOptions,
	Return extends ModuleReturn = ModuleReturn
> implements ModuleInternalContext<Options>
{
	initialized = false;
	initBus = new EventBus('onInit');
	destroyBus = new EventBus('onDestroy');

	readonly instance: OmitNil<Return>;

	constructor(public app: App, public module: Module<Options, Return>, public options: Options) {
		const cleanUp = provideModuleContext(this);

		this.instance = runThrowable('module setup', () => module({ app, options })) ?? ({} as any);
		cleanUp();
	}

	init() {
		if (this.initialized) return;

		this.initialized = true;
		this.initBus.emit();
	}

	destroy() {
		if (!this.initialized) return;

		this.initialized = false;
		this.destroyBus.emit();
	}
}
