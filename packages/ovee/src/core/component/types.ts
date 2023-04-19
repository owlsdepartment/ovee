import { EventDesc, ListenerOptions, TargetOptions } from '@/dom';
import { AnyFunction } from '@/utils';

import { App } from '../app';
import { ComponentInternalInstance } from './ComponentInternalInstance';
import { ComponentOptions } from './defineComponent';

export interface HTMLOveeElement extends HTMLElement, WithOveeInstances {}

export interface WithOveeInstances {
	_OveeComponentInstances?: ComponentInternalInstance[];
}

export interface ComponentContext<Options extends ComponentOptions = ComponentOptions> {
	app: App;
	options: Options;

	on(events: string, callback: AnyFunction, options?: ListenerOptions): void;
	off(events: string, callback: AnyFunction, options?: TargetOptions): void;
	emit<D = any>(eventDesc: EventDesc, detail?: D): void;
}

export interface ComponentInstance<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
> extends ComponentContext<Options> {
	element: Root;
}
