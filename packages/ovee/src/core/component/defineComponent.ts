import { ElementFiber, ElementFiberProps, FiberFactory } from '@/jsx';
import { AnyObject, OmitNil } from '@/utils';

import { ANONYMOUS_TAG, AnonymousElement } from './Anonymous';
import { ComponentInternalInstance } from './ComponentInternalInstance';
import { OveeCustomElement } from './getComponentCustomElement';
import { injectTemplateContext } from './templateContext';
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
		const type = ANONYMOUS_TAG;
		const { children = {} } = baseProps;
		const props = { ...baseProps } as ElementFiberProps;

		props.children = [];

		if (fiber.effectTag !== 'PLACEMENT') {
			const node = fiber.alternate?.firstChild?.node;

			if (fiber.effectTag === 'UPDATE') {
				const instance = (node as OveeCustomElement)._OveeInternalInstance;

				if (instance && instance.jsxSlot) instance.jsxSlot.value = children;
			}

			return { type, node, props };
		}

		const ctx = injectTemplateContext();

		if (!ctx) return { type, props };

		const node = <AnonymousElement>document.createElement(type);

		// NOTE: try to get default options, if exist
		const instance = new ComponentInternalInstance<Root, Options, Return>(
			'anonymous',
			<Root>(<unknown>node),
			ctx.app,
			_component,
			{} as Options,
			children
		);

		node.setup(<any>instance);

		return { type, node, props };
	};

	return _component;
}
