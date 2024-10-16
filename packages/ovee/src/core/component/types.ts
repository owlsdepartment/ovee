import { ShallowRef } from '@vue/reactivity';

import { EventDesc, ListenerOptions, TargetOptions } from '@/dom';
import { SlotChildren } from '@/jsx';
import { AnyFunction, AnyObject, EventBus } from '@/utils';

import { App } from '../app';
import { ComponentInternalInstance } from './ComponentInternalInstance';
import { ComponentOptions, ComponentProps } from './defineComponent';

export interface HTMLOveeElement extends HTMLElement, WithOveeInstances {}

export interface WithOveeInstances {
	_OveeComponentInstances?: ComponentInternalInstance[];
}

export interface ComponentContext<
	Options extends ComponentOptions = ComponentOptions,
	Props extends ComponentProps = ComponentProps
> {
	name: string;
	app: App;
	options: Options;
	props: Props;

	on(events: string, callback: AnyFunction, options?: ListenerOptions): void;
	off(events: string, callback: AnyFunction, options?: TargetOptions): void;
	emit<D = any>(eventDesc: EventDesc, detail?: D): void;
}

export interface ComponentInstance<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends ComponentProps = ComponentProps
> extends ComponentContext<Options, Props> {
	element: Root;
	instance?: AnyObject;
	renderPromise?: Promise<void>;
	beforeMountBus: EventBus;
	mountBus: EventBus;
	unmountBus: EventBus;
	jsxSlot?: ShallowRef<SlotChildren>;
}
