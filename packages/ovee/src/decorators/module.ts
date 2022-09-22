import 'reflect-metadata';

import { Component, ModuleClass } from 'src/core';
import { Logger } from 'src/errors';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils';

const logger = new Logger('@module');

export const module = instanceDecoratorFactory(
	(
		{ instance, type, proto }: DecoratorContext<Component>,
		fieldName,
		module?: string | ModuleClass
	) => {
		if (!type.includes('field')) {
			return logger.error('Decorator should only be applied to a property');
		}

		if (module === undefined || module === null) {
			module = Reflect.getOwnMetadata('design:type', proto, fieldName);

			if (!module || typeof module !== 'function') {
				return logger.error(
					'Decorator did not received any argument and could not retreive module by field type or received type is not a module class'
				);
			}
		}

		instance[fieldName] = instance.$app.getModule(module);
	}
);
