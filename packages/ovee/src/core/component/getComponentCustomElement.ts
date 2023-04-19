import { registerCustomElement } from '@/utils';

import { ComponentInternalInstance } from './ComponentInternalInstance';
import { ComponentFactory } from './setupComponent';

export abstract class OveeCustomElement extends HTMLElement {
	abstract _OveeInternalInstance: ComponentInternalInstance;
}

export function getComponentCustomElement(name: string, factory: ComponentFactory) {
	let registered = false;

	class ComponentElement extends OveeCustomElement {
		_OveeInternalInstance: ComponentInternalInstance;

		constructor() {
			super();

			this._OveeInternalInstance = factory(this);
		}

		connectedCallback() {
			this._OveeInternalInstance.mount();
		}

		disconnectedCallback() {
			this._OveeInternalInstance.unmount();
		}
	}

	return {
		ComponentElement,

		// we need to delay custom element registration, or we could potentially initialize some components before app itself
		register: () => {
			if (registered) return;

			registerCustomElement(ComponentElement, name);
			registered = true;
		},
	};
}
