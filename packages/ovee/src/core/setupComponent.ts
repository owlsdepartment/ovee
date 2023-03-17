import { registerCustomElement } from '@/utils';

import { App } from './app/App';
import { Component, ComponentOptions } from './defineComponent';
import { ComponentInternalInstance, OveeCustomElement } from './types';

export type ComponentFactory = () => ComponentInternalInstance;

export interface StoredComponent {
	name: string;
	component: Component;
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
	const factory = createComponentFactory(app, component, options);
	let registered = false;

	class ComponentElement extends OveeCustomElement {
		_OveeInternalInstance: ComponentInternalInstance;

		constructor() {
			super();

			this._OveeInternalInstance = factory();
		}

		connectedCallback() {
			this._OveeInternalInstance.mount();
		}

		disconnectedCallback() {
			this._OveeInternalInstance.unmount();
		}

		adoptedCallback() {
			// NOTE: maybe need to unmount first
			this._OveeInternalInstance.mount();
		}
	}

	return {
		name,
		factory,
		component,

		// we need to delay custom element registration, or we could potentially initialize some components before app itself
		register: () => {
			if (registered) return;

			registerCustomElement(ComponentElement, name);
			registered = true;
		},
	};
}

function createComponentFactory(
	app: App,
	component: Component,
	options: ComponentOptions
): ComponentFactory {
	return (): ComponentInternalInstance => {
		// TODO: provide context
		const instance = component(options) ?? {};

		return {
			instance,
			options,
			component,

			mount: () => {
				// TODO: implement
			},
			unmount: () => {
				// TODO: implement
			},
		};
	};
}
