export type JSXElement = undefined | null | string | number | Fiber;
export type Children = JSXElement | JSXElement[];
export type SlotProp = () => Children;
export type SlotChildren = SlotProp | Record<string | 'default', SlotProp>;

export interface Props {
	children?: Children;
	[k: string]: any;
}

export type FiberProps = FunctionFiberProps | ElementFiberProps;

export interface FunctionFiberProps {
	children?: SlotChildren;
	[k: string]: any;
}

export interface ElementFiberProps {
	children?: Fiber[];
	[k: string]: any;
}

export type Fiber = ElementFiber | FunctionFiber;

export interface ElementFiber extends FiberShared<ElementFiberProps> {
	type: string;
	alternate?: ElementFiber | null;
}

export interface FunctionFiber extends FiberShared<FunctionFiberProps> {
	type: FiberFactory;
	alternate?: FunctionFiber | null;
}

export interface FiberShared<P> {
	props: P;
	key?: string;
	node?: Node;
	parent?: Fiber;
	child?: Fiber;
	sibling?: Fiber;
	effectTag?: EffectTag;
}

export type FiberFactory = (props: FunctionFiberProps, fiber: Fiber) => Fiber;

export type EffectTag = 'UPDATE' | 'PLACEMENT' | 'DELETION';
