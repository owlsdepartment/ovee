// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(val: unknown): val is Function {
	return typeof val === 'function';
}

export function isPrimitive(v: any): v is string | number | boolean {
	return ['string', 'number', 'boolean'].includes(typeof v);
}

export function isNil(value: any): value is null | undefined {
	return value == null;
}

export const isDefined = <T>(value: T | null | undefined): value is T => {
	return !isNil(value);
};

export function isString(value: unknown): value is string {
	const type = typeof value;

	return type === 'string' || (type === 'object' && value instanceof String);
}
