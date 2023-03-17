import * as protectedFields from 'src/core/protectedFields';
import { ReactiveProxy } from 'src/reactive/ReactiveProxy';
import { Dictionary } from 'src/utils';

import { Component, ComponentOptions, ComponentReturn } from './defineComponent';

export interface ComponentInternalInstance {
	component: Component;
	instance: Exclude<ComponentReturn, void>;
	options: ComponentOptions;

	mount(): void;
	unmount(): void;
}

export abstract class OveeCustomElement extends HTMLElement {
	abstract _OveeInternalInstance: ComponentInternalInstance;
}

export interface HTMLOveeElement extends HTMLElement, WithOveeInstances {}

export interface WithOveeInstances {
	_OveeComponentInstances?: ComponentInternalInstance[];
}

/**
 *
 * ______OLD_______
 *
 * */

export interface WithReactiveProxy {
	[protectedFields.REACTIVE_PROXY]?: ReactiveProxy;
}

export interface WithDataParam {
	__dataParams?: Dictionary<() => void>;
}

export interface WithElements {
	__els?: Dictionary<() => void>;
}

export interface WithElement {
	readonly $element: Element;
}
