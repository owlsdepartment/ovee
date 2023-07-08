import { OveeCustomElement } from '@/core/component/getComponentCustomElement';

import {
	AnyComponent,
	App,
	Component,
	GetComponentInternalInstance,
	HTMLOveeElement,
} from '../core';
import { isString } from './isString';
import { toKebabCase } from './toKebabCase';

export function extractComponentInternalInstance<C extends Component = AnyComponent>(
	element: HTMLOveeElement,
	componentName: string
): GetComponentInternalInstance<C> | undefined;
export function extractComponentInternalInstance<C extends Component = AnyComponent>(
	element: HTMLOveeElement,
	component: C,
	app: App
): GetComponentInternalInstance<C> | undefined;

export function extractComponentInternalInstance(
	element: HTMLOveeElement | OveeCustomElement,
	component: Component | string,
	app?: App
): GetComponentInternalInstance<AnyComponent> | undefined {
	let componentName = '';

	if (isString(component)) {
		componentName = toKebabCase(component);
	} else if (app) {
		const storedComponent = Array.from(app.componentsManager.storedComponents.values()).find(sc => {
			return sc.component === component;
		});

		componentName = storedComponent?.name ?? '';
	}

	if (!componentName) return;

	return element._OveeComponentInstances?.find(i => i.name === componentName);
}
