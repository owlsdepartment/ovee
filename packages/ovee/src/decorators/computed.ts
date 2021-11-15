import { Component } from 'src/core';
import { Logger } from 'src/errors';
import { makeComputed } from 'src/reactive';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils';

const logger = new Logger('@computed');

export const computed = instanceDecoratorFactory(
	({ instance, proto, addDestructor }: DecoratorContext<Component>, fieldName) => {
		const descriptor =
			Object.getOwnPropertyDescriptor(instance, fieldName) ??
			Object.getOwnPropertyDescriptor(proto, fieldName);

		if (!descriptor?.get) {
			logger.error(
				`Error while creating computed on field ${fieldName}. '@computed' can only be used on getter`
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
