import { WithReactiveProxy } from 'src/core';
import { doWatchEffect, makeComponentReactive, WatchEffect, WatchOptionsBase } from 'src/reactive';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils';

export default instanceDecoratorFactory(
	(
		{ instance, addDestructor }: DecoratorContext<WithReactiveProxy>,
		methodName,
		options: WatchOptionsBase = {}
	) => {
		const method: WatchEffect = instance[methodName];

		if (typeof method !== 'function') {
			console.error('Watch decorator should be only applied to a function');
		} else {
			const callback = method.bind(instance);

			makeComponentReactive(instance);

			const destroyWatcher = doWatchEffect(callback, options);

			addDestructor(() => destroyWatcher());
		}
	}
);
