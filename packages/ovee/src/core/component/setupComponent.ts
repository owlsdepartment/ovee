import { App } from '../app/App';
import { ComponentInternalInstance } from './ComponentInternalInstance';
import { Component, ComponentOptions } from './defineComponent';
import { getComponentCustomElement } from './getComponentCustomElement';

export type ComponentFactory = (element: HTMLElement) => ComponentInternalInstance;

export interface StoredComponent {
	name: string;
	component: Component;
	options: ComponentOptions;
	factory: ComponentFactory;
	register: () => void;
}

export function setupComponent(
	app: App,
	name: string,
	component: Component,
	_options?: ComponentOptions
): StoredComponent {
	const options = _options || {};
	const factory: ComponentFactory = (el: HTMLElement) =>
		new ComponentInternalInstance(el, app, component, options);
	const { register } = getComponentCustomElement(name, factory);

	return {
		name,
		component,
		options,

		factory,
		register,
	};
}
