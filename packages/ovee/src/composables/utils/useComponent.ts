import {
	Component,
	GetComponentInstance,
	GetComponentOptions,
	injectComponentContext,
} from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('useComponent');

export function useComponent<C extends Component>(
	component: C,
	options?: GetComponentOptions<C>
): GetComponentInstance<C> {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useComponent'));

		return null as any;
	}

	if (!component.__ovee_component_definition) {
		logger.error('Received argument is not an Ovee component');

		return null as any;
	}

	options ??= instance.options;

	return component(instance.element, instance, options) as any;
}
