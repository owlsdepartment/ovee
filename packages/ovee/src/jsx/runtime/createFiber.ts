import { Child, Children, Fiber, FiberFactory, FiberProps, Props } from './types';

export const TEXT_FIBER = 'TEXT_FIBER';

export function createFiber(tag: string | FiberFactory, _props: Props = {}): Fiber {
	const props = { ..._props } as FiberProps;

	if (_props.children) {
		props.children = translateChildren(_props.children);
	}

	return {
		type: tag,
		props,
	} as Fiber;
}

function translateChildren(children: Children): Fiber[] {
	if (Array.isArray(children)) {
		return children.map(c => translateChild(c));
	}

	return [translateChild(children)];
}

function translateChild(child: Child): Fiber {
	if (typeof child === 'string' || typeof child === 'number') {
		return createTextFiber(child);
	}

	return child;
}

function createTextFiber(text: string | number): Fiber {
	return {
		type: TEXT_FIBER,
		props: {
			nodeValue: text,
		},
	};
}
