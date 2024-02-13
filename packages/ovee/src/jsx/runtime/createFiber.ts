import { isDefined } from '@/utils';

import {
	Children,
	ElementFiberProps,
	Fiber,
	FiberFactory,
	FunctionFiberProps,
	JSXElement,
	Props,
} from './types';

export const JSX_TEXT_FIBER = '__TEXT_FIBER';
export const JSX_FRAGMENT = '__FRAGMENT';

export function createFragment(_props: ElementFiberProps = {}): Fiber {
	const props = _props;

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

	const props = _props as FunctionFiberProps;

	return {
		type: tag,
		props,
		key,
	};
}

function translateChildren(children: Children): Fiber[] {
	if (Array.isArray(children)) {
		return children.map(c => translateChild(c)).filter(isDefined);
	}

	const child = translateChild(children);

	return child ? [child] : [];
}

function translateChild(child: JSXElement): Fiber | null | undefined {
	if (typeof child === 'string' || typeof child === 'number') {
		return createTextFiber(child);
	}

	return child;
}

function createTextFiber(text: string | number): Fiber {
	return {
		type: JSX_TEXT_FIBER,
		props: {
			nodeValue: text,
		},
	};
}
