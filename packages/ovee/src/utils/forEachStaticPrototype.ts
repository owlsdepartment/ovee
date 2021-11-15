export function forEachStaticPrototype<T = any>(obj: any, cb: (target: T) => void): void {
	if (obj === null || obj === undefined) {
		return;
	}

	let target = Object.getPrototypeOf(obj);

	while (target.constructor !== Object) {
		cb(target.constructor);

		target = Object.getPrototypeOf(target);
	}
}
