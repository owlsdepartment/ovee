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
