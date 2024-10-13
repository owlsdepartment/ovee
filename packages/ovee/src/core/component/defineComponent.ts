import { ElementFiber, ElementFiberProps, FiberFactory } from '@/jsx';
import { AnyObject, EmptyObject, OmitNil } from '@/utils';

import { ANONYMOUS_TAG, AnonymousElement } from './Anonymous';
import { ComponentInternalInstance } from './ComponentInternalInstance';
import { OveeCustomElement } from './getComponentCustomElement';
import {
	NormalizedProps,
	normalizeProps,
	PropsDefinition,
	PropsDefinitionToRawTypes,
} from './props';
import { injectTemplateContext } from './templateContext';
import { ComponentContext } from './types';

export type ComponentProps = AnyObject;
export type ComponentOptions = AnyObject;
export type ComponentReturn = AnyObject | void;
export type AnyComponent = Component<any, any, any, any>;

export interface ComponentDefineFunction<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends PropsDefinition = PropsDefinition,
	Return extends ComponentReturn = ComponentReturn
> {
	(element: Root, context: ComponentContext<Options, PropsDefinitionToRawTypes<Props>>): Return;
}

export type GetComponentInstance<C extends AnyComponent, Return = ReturnType<C>> = OmitNil<Return>;
export type GetComponentOptions<C extends AnyComponent> = Parameters<C>[1]['options'];
export type GetComponentProps<C extends AnyComponent> = Parameters<C>[1]['props'];
export type GetComponentRoot<C extends AnyComponent> = Parameters<C>[0];
export type GetComponentInternalInstance<C extends AnyComponent> = ComponentInternalInstance<
	GetComponentRoot<C>,
	GetComponentOptions<C>,
	GetComponentProps<C>,
	GetComponentInstance<C>
>;

export interface Component<
	Root extends HTMLElement = HTMLElement,
	O extends ComponentOptions = ComponentOptions,
	P extends PropsDefinition = PropsDefinition,
	R extends ComponentReturn = ComponentReturn
> extends ComponentDefineFunction<Root, O, P, R> {
	__ovee_component_definition: true;
	__ovee_props: NormalizedProps;
	jsx: FiberFactory<PropsDefinitionToRawTypes<P> & AnyObject>;
}

export function defineComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends PropsDefinition = PropsDefinition,
	Return extends ComponentReturn = ComponentReturn
>(
	props: Props,
	component: ComponentDefineFunction<Root, Options, Props, Return>
): Component<Root, Options, Props, Return>;

export function defineComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Return extends ComponentReturn = ComponentReturn
>(
	component: ComponentDefineFunction<Root, Options, EmptyObject, Return>
): Component<Root, Options, EmptyObject, Return>;

export function defineComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends PropsDefinition = PropsDefinition,
	Return extends ComponentReturn = ComponentReturn
>(
	firstArg: Props | ComponentDefineFunction<Root, Options, Props, Return>,
	secondArg?: ComponentDefineFunction<Root, Options, Props, Return>
): Component<Root, Options, Props, Return> {
	const _component = (typeof firstArg === 'function' ? firstArg : secondArg) as Component<
		Root,
		Options,
		Props,
		Return
	>;
	const props = (typeof firstArg === 'function' ? {} : firstArg) as Props;

	_component.__ovee_component_definition = true;
	_component.__ovee_props = normalizeProps(props);
	_component.jsx = (baseProps, fiber): ElementFiber => {
		const type = ANONYMOUS_TAG;
		const { children = {} } = baseProps;
		let props = baseProps as ElementFiberProps;

		delete baseProps.children;

		// TODO: check update
		if (fiber.effectTag !== 'PLACEMENT') {
			const node = fiber.alternate?.firstChild?.node;

			if (fiber.effectTag === 'UPDATE') {
				const instance = (node as OveeCustomElement)._OveeInternalInstance;

				if (instance) {
					if (instance.jsxSlot) instance.jsxSlot.value = children;

					props = instance.updateProps(props);
				}
			}

			return { type, node, props };
		}

		const ctx = injectTemplateContext();

		if (!ctx) return { type, props };

		const node = <AnonymousElement>document.createElement(type);

		// NOTE: try to get default options, if exist
		const instance = new ComponentInternalInstance<
			Root,
			Options,
			PropsDefinitionToRawTypes<Props>,
			Return
		>(
			'anonymous',
			<Root>(<unknown>node),
			ctx.app,
			_component as AnyComponent,
			{} as Options,
			children,
			instance => {
				props = instance.updateProps(props);
			}
		);

		node.setup(<any>instance);

		console.log('-->', props);

		return { type, node, props };
	};

	return _component;
}
