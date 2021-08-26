import { WithReactiveProxy } from 'src/core/types';

import ReactiveProxy from './ReactiveProxy';

export default function(instance: WithReactiveProxy): ReactiveProxy {
	// might be replaced with more sophisticated implementation
	// using WeakMap, but let's keep it dead simple for now
	if (!instance.__reactiveProxy) {
		instance.__reactiveProxy = new ReactiveProxy(instance);
	}

	return instance.__reactiveProxy;
}
