import { Component } from 'src/core';
import { Logger } from 'src/errors';
import { makeComputed } from 'src/reactive';
import { DecoratorContext, getPropertyDescriptor, instanceDecoratorFactory } from 'src/utils';

const logger = new Logger('@computed');

export const computed = instanceDecoratorFactory(
	({ instance, addDestructor }: DecoratorContext<Component>, fieldName) => {
		const descriptor = getPropertyDescriptor(instance, fieldName);

		if (!descriptor?.get) {
			logger.error(
				`Error while creating computed on field ${fieldName}. '@computed' can only be used on getter`
			);

			return;
		}

		const fieldComputed = makeComputed(descriptor.get.bind(instance));

		Object.defineProperty(instance, fieldName, {
			...descriptor,
			get: () => fieldComputed.value,
		});

		addDestructor(() => {
			fieldComputed.effect.stop();
		});
	}
);
