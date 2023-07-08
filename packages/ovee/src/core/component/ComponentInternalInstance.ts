import { EventDelegate, EventDesc, ListenerOptions, TargetOptions } from '@/dom';
import { AnyFunction, EventBus, OmitNil } from '@/utils';

import { App } from '../app';
import { provideComponentContext } from './componentContext';
import { Component, ComponentOptions, ComponentReturn } from './defineComponent';
import { ComponentContext, ComponentInstance, WithOveeInstances } from './types';

export class ComponentInternalInstance<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Return extends ComponentReturn = ComponentReturn
> implements ComponentInstance<Root, Options>
{
	mounted = false;
	mountBus = new EventBus();
	unmountBus = new EventBus();

	readonly instance: OmitNil<Return>;
	readonly eventDelegate: EventDelegate<this>;

	get unmounted() {
		return !this.mounted;
	}

	get oveeElement() {
		return this.element as Root & WithOveeInstances;
	}

	private get componentContext(): ComponentContext<Options> {
		return {
			name: this.name,
			app: this.app,
			options: this.options as Options,

			emit: (...args) => this.emit(...args),
			on: (...args) => this.on(...args),
			off: (...args) => this.off(...args),
		};
	}

	constructor(
		public name: string,
		public element: Root,
		public app: App,
		public component: Component<Root, Options, Return>,
		public options: Options
	) {
		this.eventDelegate = new EventDelegate(element, this);

		const cleanUp = provideComponentContext(this);

		this.instance = component(element, this.componentContext) ?? ({} as any);
		cleanUp();

		this.saveInstanceOnElement();
	}

	mount() {
		if (this.mounted) return;

		this.mounted = true;
		this.mountBus.emit();
	}

	unmount() {
		if (!this.mounted) return;

		this.mounted = false;
		this.unmountBus.emit();
	}

	saveInstanceOnElement() {
		const self = this as any as ComponentInternalInstance;

		if (!this.oveeElement._OveeComponentInstances) {
			this.oveeElement._OveeComponentInstances = [self];
		} else {
			if (this.oveeElement._OveeComponentInstances.includes(self)) return;

			this.oveeElement._OveeComponentInstances.push(self);
		}
	}

	on(events: string, callback: AnyFunction, options?: ListenerOptions): () => void {
		return this.eventDelegate.on(events, callback, options);
	}

	off(events: string, callback: AnyFunction, options?: TargetOptions): void {
		return this.eventDelegate.off(events, callback, options);
	}

	emit<D = any>(eventDesc: EventDesc, detail?: D): void {
		this.eventDelegate.emit(eventDesc, detail);
	}
}
