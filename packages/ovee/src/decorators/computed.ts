import { makeComputed } from 'src/reactive';
import { instanceDecoratorFactory } from 'src/utils';

export const computed = instanceDecoratorFactory(
	({ instance, proto, addDestructor }, fieldName) => {
		const descriptor =
			Object.getOwnPropertyDescriptor(instance, fieldName) ??
			Object.getOwnPropertyDescriptor(proto, fieldName);

		if (!descriptor?.get) {
			console.error(
				`[Ovee.js | computed] Error while creating computed on field ${fieldName}. 'computed' can only be used on getter`
			);

			return;
		}

		const fieldComputed = makeComputed(descriptor.get);

		Object.defineProperty(instance, fieldName, {
			...descriptor,
			get: () => fieldComputed.value,
		});

		addDestructor(() => {
			fieldComputed.effect.stop();
		});
	}
);
