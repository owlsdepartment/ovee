import { Component, ModuleClass } from 'src/core';
import { Logger } from 'src/errors';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils';

const logger = new Logger('@module');

export const module = instanceDecoratorFactory(
	({ instance, type }: DecoratorContext<Component>, fieldName, module: string | ModuleClass) => {
		if (!type.includes('field')) {
			return logger.error('Decorator should only be applied to a property');
		}

		instance[fieldName] = instance.$app.getModule(module);
	}
);
