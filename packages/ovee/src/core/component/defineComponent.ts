import { ElementFiber, ElementFiberProps, FiberFactory } from '@/jsx';
import { AnyObject, OmitNil } from '@/utils';

import { ComponentInternalInstance } from './ComponentInternalInstance';
import { injectTemplateContext } from './templateContext';
import { ComponentContext, HTMLOveeElement } from './types';

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
	jsx: FiberFactory;
}

export function defineComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Return extends ComponentReturn = ComponentReturn
>(component: ComponentDefineFunction<Root, Options, Return>): Component<Root, Options, Return> {
	const _component = component as Component<Root, Options, Return>;

	_component.__ovee_component_definition = true;
	_component.jsx = (baseProps, fiber): ElementFiber => {
		const type = 'ovee-anonymous';
		const { children = {} } = baseProps;
		const props = { ...baseProps } as ElementFiberProps;

		props.children = [];

		if (fiber.effectTag !== 'PLACEMENT') {
			const node = fiber.alternate?.child?.node;

			if (fiber.effectTag === 'UPDATE') {
				const instance = (node as HTMLOveeElement)._OveeComponentInstances?.[0];

				if (instance && instance.jsxSlot) instance.jsxSlot.value = children;
			}

			return { type, node, props };
		}

		const ctx = injectTemplateContext();

		if (!ctx) return { type, props };

		const node = document.createElement(type);

		// NOTE: try default options, if exist
		new ComponentInternalInstance<Root, Options, Return>(
			'anonymous',
			node as Root,
			ctx.app,
			_component,
			{} as Options,
			children
		);

		return { type, node, props };
	};

	return _component;
}
