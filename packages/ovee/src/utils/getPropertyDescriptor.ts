/**
 * Same as Reflect.getOwnPropertyDescriptor but goes down the prototype chain
 */
export function getPropertyDescriptor(target: any, propertyKey: string) {
	const desc = Reflect.getOwnPropertyDescriptor(target, propertyKey);

	if (desc) return desc;

	let base = target;

	while (base) {
		const desc = Reflect.getOwnPropertyDescriptor(base, propertyKey);

		if (desc) return desc;

		base = Reflect.getPrototypeOf(base);
	}

	return undefined;
}
