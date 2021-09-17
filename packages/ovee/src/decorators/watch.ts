import { WithReactiveProxy } from 'src/core';
import {
	handleCombinedWatch,
	makeComponentReactive,
	MultiWatchSources,
	WatchCallback,
	WatchOptions,
	WatchSource,
} from 'src/reactive';
import { DecoratorContext, instanceDecoratorFactory } from 'src/utils';

export default instanceDecoratorFactory(
	(
		{ instance, addDestructor }: DecoratorContext<WithReactiveProxy>,
		methodName,
		source: string | WatchSource | MultiWatchSources,
		options: WatchOptions = {}
	) => {
		const method: WatchCallback = instance[methodName];

		if (typeof method !== 'function') {
			console.error('Watch decorator should be only applied to a function');
		} else if (!source) {
			console.error('Path name or source must be provided for watch decorator');
		} else {
			const callback = method.bind(instance);

			makeComponentReactive(instance);

			const destroyWatcher = handleCombinedWatch(instance, source, callback, options);

			addDestructor(() => destroyWatcher());
		}
	}
);
