import { isDefined, isPrimitive } from '@/utils';

import {
	ElementFiberProps,
	Fiber,
	FiberFactory,
	FunctionFiberProps,
	JSXElement,
	Props,
} from './types';

export const JSX_TEXT_FIBER = '__TEXT_FIBER';
export const JSX_FRAGMENT = '__FRAGMENT';

export function createFragment(_props: Props = {}): Fiber {
	const props = _props as ElementFiberProps;
	const children = (_props as Props).children;

	if (children) {
		props.children = translateChildren(children);
	}

	return {
		type: JSX_FRAGMENT,
		props,
	};
}

export function createFiber(
	tag: string | FiberFactory,
	_props: Props | FunctionFiberProps = {},
	key?: string
): Fiber {
	if (typeof tag === 'string') {
		const props = _props as ElementFiberProps;
		const children = (_props as Props).children;

		if (children) {
			props.children = translateChildren(children);
		}

		return {
			type: tag,
			props,
			key,
		};
	}

	// TODO: maybe function props also needs translation

	const props = _props as FunctionFiberProps;

	return {
		type: tag,
		props,
		key,
	};
}

function translateChildren(children: Props['children']): Fiber[] {
	if (Array.isArray(children)) {
		const out = children
			.flatMap(c => (Array.isArray(c) ? c.map(translateChild) : translateChild(c)))
			.filter(isDefined);

		return out;
	}

	const child = translateChild(children);

	return child ? [child] : [];
}

function translateChild(child: JSXElement): Fiber | null | undefined {
	if (isPrimitive(child)) {
		return createTextFiber(child);
	}

	return child;
}

function createTextFiber(text: string | number | boolean): Fiber {
	return {
		type: JSX_TEXT_FIBER,
		props: {
			nodeValue: text,
		},
	};
}
