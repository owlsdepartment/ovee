import { AnyComponent, App, Component, GetComponentInstance, HTMLOveeElement } from '../core';
import { extractComponentInternalInstance } from './extractComponentInternalInstance';
import { isString } from './isString';

export function extractComponent<C extends Component = AnyComponent>(
	element: HTMLOveeElement,
	componentName: string
): GetComponentInstance<C> | undefined;
export function extractComponent<C extends Component = AnyComponent>(
	element: HTMLOveeElement,
	component: C,
	app: App
): GetComponentInstance<C> | undefined;

export function extractComponent(
	element: HTMLOveeElement,
	component: Component | string,
	app?: App
): GetComponentInstance<AnyComponent> | undefined {
	if (isString(component)) {
		return extractComponentInternalInstance(element, component)?.instance;
	} else if (app) {
		return extractComponentInternalInstance(element, component, app)?.instance;
	}
}
