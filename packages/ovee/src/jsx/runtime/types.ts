export type Child = string | number | Fiber;
export type Children = Child | Child[];

export interface Props {
	children?: Children;
	[k: string]: any;
}

export interface FiberProps {
	children?: Fiber[];
	[k: string]: any;
}

export type Fiber = ElementFiber | FunctionFiber;

export interface ElementFiber extends FiberShared {
	type: string;
}

export interface FunctionFiber extends FiberShared {
	type: FiberFactory;
}

export interface FiberShared {
	props: FiberProps;
	node?: Node;
	parent?: Fiber;
	child?: Fiber;
	sibling?: Fiber;
	alternate?: Fiber | null;
	effectTag?: EffectTag;
}

export type FiberFactory = (props?: FiberProps) => Fiber;

export type EffectTag = 'UPDATE' | 'PLACEMENT' | 'DELETION';
