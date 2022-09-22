import { Component } from 'src/core';
import { Callback, ListenerOptions } from 'src/dom';
import { Logger } from 'src/errors';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils/instanceDecoratorFactory';

const logger = new Logger('@bind');

export const bind = instanceDecoratorFactory(
	(
		{ instance }: DecoratorContext<Component>,
		methodName,
		events: string,
		options?: ListenerOptions
	) => {
		if (typeof (instance as any)[methodName] !== 'function') {
			return logger.error('Bind decorator should be only applied to a function');
		}
		if (!events) {
			return logger.error('Event name must be provided for bind decorator');
		}

		const callback: Callback<Component> = (instance as any)[methodName].bind(instance);
		const args = [events, callback, options] as const;

		instance.$on(...args);
	}
);
