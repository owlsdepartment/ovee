import * as protectedFields from 'src/core/protectedFields';
import { WithReactiveProxy } from 'src/core/types';

import { ReactiveProxy } from './ReactiveProxy';

export function makeComponentReactive(instance: WithReactiveProxy): ReactiveProxy {
	// might be replaced with more sophisticated implementation
	// using WeakMap, but let's keep it dead simple for now
	if (!instance[protectedFields.REACTIVE_PROXY]) {
		instance[protectedFields.REACTIVE_PROXY] = new ReactiveProxy(instance);
	}

	return instance[protectedFields.REACTIVE_PROXY]!;
}
