const hasOwnProperty = Object.prototype.hasOwnProperty;

export const hasOwn = (val: object, key: string | symbol): key is keyof typeof val =>
	hasOwnProperty.call(val, key);
