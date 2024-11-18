import { EffectScope, effectScope } from '@vue/reactivity';

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

	readonly scope: EffectScope;
	readonly instance: OmitNil<Return>;

	constructor(public app: App, public module: Module<Options, Return>, public options: Options) {
		const cleanUp = provideModuleContext(this);

		this.scope = effectScope(true);
		this.instance = this.scope.run(
			() => runThrowable('module setup', () => module({ app, options })) ?? ({} as any)
		);
		cleanUp();
	}

	init() {
		if (this.initialized) return;

		this.initialized = true;
		this.scope.run(() => this.initBus.emit());
	}

	destroy() {
		if (!this.initialized) return;

		this.initialized = false;
		this.scope.stop();
		this.destroyBus.emit();
	}
}
