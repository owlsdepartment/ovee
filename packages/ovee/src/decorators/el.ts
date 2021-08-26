import { WithElement, WithElements } from 'src/core/types';
import attachMutationObserver, { MutationCallback } from 'src/utils/attachMutationObserver';
import instanceDecoratorFactory, { DecoratorContext } from 'src/utils/instanceDecoratorFactory';
import isValidNode from 'src/utils/isValidNode';

interface ElDecoratorOptions {
	list?: boolean;
}

type Target = WithElements & WithElement;

export default instanceDecoratorFactory(
	(
		{ instance, addDestructor }: DecoratorContext<Target>,
		prop,
		selector: string,
		options: ElDecoratorOptions = {}
	) => {
		if (typeof (instance as any)[prop] === 'function') {
			console.error('El decorator should be only applied to a property');
		} else if (!selector) {
			console.error('Selector must be provided for el decorator');
		} else {
			const queryMethod = options.list === true ? 'querySelectorAll' : 'querySelector';

			if (!instance.__els) {
				instance.__els = {};
			}

			instance.__els[prop] = () => {
				(instance as any)[prop] = (instance.$element as any)[queryMethod](selector);
			};

			instance.__els[prop]();

			const _mutationHook: MutationCallback = affectedNodes => {
				const matches = Array.from(affectedNodes)
					.filter(isValidNode)
					.some(node => node.matches(selector) || node.querySelector(selector));

				if (matches) {
					instance.__els![prop]();
				}
			};

			const observer = attachMutationObserver(instance.$element, _mutationHook, _mutationHook);

			addDestructor(() => {
				observer.disconnect();
			});
		}
	}
);
