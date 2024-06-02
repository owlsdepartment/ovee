import { registerCustomElement } from '@/utils';

import { ComponentInternalInstance } from './ComponentInternalInstance';
import { OveeCustomElement } from './getComponentCustomElement';

export const ANONYMOUS_TAG = 'ovee-anonymous';

export class AnonymousElement extends OveeCustomElement {
	_OveeInternalInstance!: ComponentInternalInstance;
	_OveeComponentInstances: ComponentInternalInstance[] = [];

	constructor() {
		super();
	}

	setup(instance: ComponentInternalInstance) {
		this._OveeInternalInstance = instance;
		this._OveeComponentInstances.push(instance);
	}

	connectedCallback() {
		this._OveeInternalInstance.mount();
	}

	disconnectedCallback() {
		this._OveeInternalInstance.unmount();
	}
}

registerCustomElement(AnonymousElement, ANONYMOUS_TAG);
