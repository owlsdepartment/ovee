import { AnyObject } from '@/utils';

export type JSXElement = undefined | null | boolean | string | number | Fiber;
export type Children = JSXElement | JSXElement[];
export type SlotProp = () => JSXElement;
export type SlotChildren = SlotProp | Record<string | 'default', SlotProp>;

export interface Props {
	children?: Children | Children[];
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
	key?: string | number | symbol;
	node?: Node;
	parent?: Fiber;
	parentNode?: Node;
	firstChild?: Fiber;
	lastChild?: Fiber;
	prevSiblingNode?: Node | null;
	nextSibling?: Fiber;
	nextSiblingNode?: Node;
	effectTag?: EffectTag;
}

export type FiberFactory<Props extends AnyObject = AnyObject> = (
	props: FunctionFiberProps & Props,
	fiber: Fiber
) => Fiber;

export type EffectTag = 'UPDATE' | 'PLACEMENT' | 'DELETION';
