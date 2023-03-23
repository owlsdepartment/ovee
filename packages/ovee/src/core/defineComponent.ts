import { AnyObject, OmitNil } from '@/utils';

export type ComponentOptions = AnyObject;
export type ComponentReturn = AnyObject | void;
export type AnyComponent = Component<any, any, any>;

export interface ComponentDefineFunction<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Return extends ComponentReturn = ComponentReturn
> {
	(element: Root, options: Partial<Options>): Return;
}

export type GetComponentInstance<C extends AnyComponent, Return = ReturnType<C>> = OmitNil<Return>;

export type GetComponentOptions<C extends AnyComponent> = Parameters<C>[1];

export type GetComponentRoot<C extends AnyComponent> = Parameters<C>[0];

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
