import { WithReactiveProxy } from 'src/core';
import { Logger } from 'src/errors';
import { doWatchEffect, makeComponentReactive, WatchEffect, WatchOptionsBase } from 'src/reactive';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils';

const logger = new Logger('@watchEffect');

export default instanceDecoratorFactory(
	(
		{ instance, addDestructor }: DecoratorContext<WithReactiveProxy>,
		methodName,
		options: WatchOptionsBase = {}
	) => {
		const method: WatchEffect = instance[methodName];

		if (typeof method !== 'function') {
			return logger.error('Watch decorator should be only applied to a function');
		}

		const callback = method.bind(instance);

		makeComponentReactive(instance);

		const destroyWatcher = doWatchEffect(callback, options);

		addDestructor(() => destroyWatcher());
	}
);
