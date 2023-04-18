import { EventDelegate, EventDesc, ListenerOptions, TargetOptions } from '@/dom';
import { AnyFunction, EventBus, OmitNil } from '@/utils';

import { App } from '../app';
import { Component, ComponentOptions, ComponentReturn } from '../defineComponent';
import { ComponentContext, ComponentInstance } from '../types';
import { provideComponentContext } from './componentContext';

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

	private get componentContext(): ComponentContext<Options> {
		return {
			app: this.app,
			options: this.options as Options,

			emit: (...args) => this.emit(...args),
			on: (...args) => this.on(...args),
			off: (...args) => this.off(...args),
		};
	}

	constructor(
		public element: Root,
		public app: App,
		public component: Component<Root, Options, Return>,
		public options: Options
	) {
		this.eventDelegate = new EventDelegate(element, this);

		const cleanUp = provideComponentContext(this);

		this.instance = component(element, this.componentContext) ?? ({} as any);
		cleanUp();
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
