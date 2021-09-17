import Component from 'src/core/Component';
import { Callback } from 'src/dom/EventDelegate';
import { Logger } from 'src/errors/logger';
import instanceDecoratorFactory, { DecoratorContext } from 'src/utils/instanceDecoratorFactory';

type OnArgs = [string, string, Callback<Component>];

const logger = new Logger('@bind');

export default instanceDecoratorFactory(
	({ instance }: DecoratorContext<Component>, methodName, eventName: string, selector?: string) => {
		if (typeof (instance as any)[methodName] !== 'function') {
			return logger.error('Bind decorator should be only applied to a function');
		}
		if (!eventName) {
			return logger.error('Event name must be provided for bind decorator');
		}

		const callback: Callback<Component> = (instance as any)[methodName].bind(instance);
		const args: any[] = [eventName];

		if (selector) {
			args.push(selector);
		}
		args.push(callback);

		instance.$on(...(args as OnArgs));
	}
);
