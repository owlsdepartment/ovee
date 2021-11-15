import { WithReactiveProxy } from 'src/core/types';
import { Logger } from 'src/errors';
import { makeComponentReactive } from 'src/reactive';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils/instanceDecoratorFactory';

const logger = new Logger('@reactive');

export const reactive = instanceDecoratorFactory(
	({ instance }: DecoratorContext<WithReactiveProxy>, propName) => {
		if (typeof instance[propName] === 'function') {
			return logger.error('Decorator should only be applied to a property');
		}

		const reactiveProxy = makeComponentReactive(instance);

		reactiveProxy.enableFor(propName);
	}
);
