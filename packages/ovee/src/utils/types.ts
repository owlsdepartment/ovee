export interface ClassConstructor<T> extends Function {
	new (...args: any[]): T;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type Class<T, C extends Function> = C & ClassConstructor<T>;

export interface Dictionary<T> {
	[key: string]: T;
}

export type AnyFunction = (...args: any[]) => any;

export type AnyObject = Record<string, any>;

export type EmptyObject = Record<string, never>;

export type OmitNil<Base, Fallback = AnyObject> = Base extends void | undefined | null
	? Fallback
	: Base;

export type OmitConstructorKeys<T> = {
	[P in keyof T]: T[P] extends new () => any ? never : P;
}[keyof T];

export type OmitConstructor<T> = Pick<T, OmitConstructorKeys<T>>;

export interface OveeRef<V> {
	value: V;
}

export interface OveeReadonlyRef<V> {
	readonly value: V;
}
