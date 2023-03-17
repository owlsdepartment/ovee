import { AnyObject } from '@/utils';

export type ComponentOptions = AnyObject;
export type ComponentReturn = AnyObject | void;

export interface ComponentDefineFunction<
	O extends ComponentOptions = ComponentOptions,
	R extends ComponentReturn = ComponentReturn
> {
	(o: Partial<O>): R;
}

export type GetComponentInstance<C extends Component, Return = ReturnType<C>> = Return extends
	| void
	| undefined
	| null
	? AnyObject
	: Return;

export type GetComponentOptions<C extends Component> = Parameters<C>[0];

export interface Component<
	O extends ComponentOptions = ComponentOptions,
	R extends ComponentReturn = ComponentReturn
> extends ComponentDefineFunction<O, R> {
	__ovee_component_definition: true;
}

export function defineComponent<
	O extends ComponentOptions = ComponentOptions,
	R extends ComponentReturn = ComponentReturn
>(component: ComponentDefineFunction<O, R>): Component<O, R> {
	const _component = component as Component<O, R>;

	_component.__ovee_component_definition = true;

	return _component;
}
