import { WithReactiveProxy } from 'src/core/types';
import { makeComponentReactive } from 'src/reactive';
import instanceDecoratorFactory, { DecoratorContext } from 'src/utils/instanceDecoratorFactory';

export default instanceDecoratorFactory(
	({ instance }: DecoratorContext<WithReactiveProxy>, propName) => {
		if (typeof instance[propName] === 'function') {
			console.error('Reactive decorator should be only applied to a property');
		} else {
			const reactiveProxy = makeComponentReactive(instance);

			reactiveProxy.enableFor(propName);
		}
	}
);
