import { EventDesc, ListenerOptions, TargetOptions } from '@/dom';
import { AnyFunction } from '@/utils';

import { App } from './app';
import { ComponentInternalInstance } from './Component';
import { ComponentOptions } from './defineComponent';

export abstract class OveeCustomElement extends HTMLElement {
	abstract _OveeInternalInstance: ComponentInternalInstance;
}

export interface HTMLOveeElement extends HTMLElement, WithOveeInstances {}

export interface WithOveeInstances {
	_OveeComponentInstances?: ComponentInternalInstance[];
}

export interface ComponentInstance<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
> {
	element: Root;
	app: App;
	options: Options;

	on(events: string, callback: AnyFunction, options?: ListenerOptions): void;
	off(events: string, callback: AnyFunction, options?: TargetOptions): void;
	emit<D = any>(eventDesc: EventDesc, detail?: D): void;
}
