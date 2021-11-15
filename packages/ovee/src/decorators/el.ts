import { WithElement, WithElements } from 'src/core/types';
import { Logger } from 'src/errors';
import {
	attachMutationObserver,
	DecoratorContext,
	instanceDecoratorFactory,
	isValidNode,
	MutationCallback,
} from 'src/utils';

interface ElDecoratorOptions {
	list?: boolean;
}

type Target = WithElements & WithElement;

const logger = new Logger('@el');

export const el = instanceDecoratorFactory(
	(
		{ instance, addDestructor }: DecoratorContext<Target>,
		prop,
		selector: string,
		options: ElDecoratorOptions = {}
	) => {
		if (typeof (instance as any)[prop] === 'function') {
			return logger.error('Decorator should only be applied to a property');
		}
		if (!selector) {
			return logger.error('Selector must be provided');
		}

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
);
