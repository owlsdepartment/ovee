import { AnyObject, OmitNil } from '@/utils';

import { ComponentInternalInstance } from './ComponentInternalInstance';
import { ComponentContext } from './types';

export type ComponentOptions = AnyObject;
export type ComponentReturn = AnyObject | void;
export type AnyComponent = Component<any, any, any>;

export interface ComponentDefineFunction<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Return extends ComponentReturn = ComponentReturn
> {
	(element: Root, context: ComponentContext<Options>): Return;
}

export type GetComponentInstance<C extends AnyComponent, Return = ReturnType<C>> = OmitNil<Return>;

export type GetComponentOptions<C extends AnyComponent> = Parameters<C>[1]['options'];

export type GetComponentRoot<C extends AnyComponent> = Parameters<C>[0];

export type GetComponentInternalInstance<C extends AnyComponent> = ComponentInternalInstance<
	GetComponentRoot<C>,
	GetComponentOptions<C>,
	GetComponentInstance<C>
>;

export interface Component<
	Root extends HTMLElement = HTMLElement,
	O extends ComponentOptions = ComponentOptions,
	R extends ComponentReturn = ComponentReturn
> extends ComponentDefineFunction<Root, O, R> {
	__ovee_component_definition: true;
}

export function defineComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Return extends ComponentReturn = ComponentReturn
>(component: ComponentDefineFunction<Root, Options, Return>): Component<Root, Options, Return> {
	const _component = component as Component<Root, Options, Return>;

	_component.__ovee_component_definition = true;

	return _component;
}
