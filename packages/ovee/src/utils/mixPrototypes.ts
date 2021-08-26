/* eslint-disable @typescript-eslint/ban-types */
import { ClassConstructor } from './types';

// based on Strudel.js implementation of mixPrototypes helper
function mixPrototype<T = any>(
	Target: Function,
	Source: ClassConstructor<T>,
	protectedMethods: string[] = []
): void {
	const targetProto = Target.prototype;
	const sourceProto = Source.prototype;
	const inst = new Source();

	Object.getOwnPropertyNames(inst).forEach(name => {
		const desc = Object.getOwnPropertyDescriptor(inst, name)!;

		desc.writable = true;
		Object.defineProperty(targetProto, name, desc);
	});

	Object.getOwnPropertyNames(sourceProto).forEach(name => {
		if (protectedMethods.indexOf(name) !== -1) {
			if (name !== 'constructor') {
				console.error(`Class tried to override protected instance method ${name}`, Source);
			}
		} else {
			Object.defineProperty(targetProto, name, Object.getOwnPropertyDescriptor(sourceProto, name)!);
		}
	});
}

export default mixPrototype;
