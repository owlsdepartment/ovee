import { WithReactiveProxy } from 'src/core';
import { Logger } from 'src/errors';
import {
	handleCombinedWatch,
	makeComponentReactive,
	MultiWatchSources,
	WatchCallback,
	WatchOptions,
	WatchSource,
} from 'src/reactive';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils';

const logger = new Logger('@watch');

export const watch = instanceDecoratorFactory(
	(
		{ instance, addDestructor }: DecoratorContext<WithReactiveProxy>,
		methodName,
		source: string | WatchSource | MultiWatchSources,
		options: WatchOptions = {}
	) => {
		const method: WatchCallback = instance[methodName];

		if (typeof method !== 'function') {
			return logger.error('Decorator should only be applied to a function');
		}
		if (!source) {
			return logger.error('Path name or source must be provided');
		}

		const callback = method.bind(instance);

		makeComponentReactive(instance);

		const destroyWatcher = handleCombinedWatch(instance, source, callback, options);

		addDestructor(() => destroyWatcher());
	}
);
