import { Logger } from '@/errors';
import { AnyObject, EventBus } from '@/utils';

import { ComponentInstance } from './types';

export interface ComponentInternalContext extends ComponentInstance {
	instance?: AnyObject;
	mountBus: EventBus;
	unmountBus: EventBus;
}

const logger = new Logger('componentContext');

let currentContext: null | ComponentInternalContext = null;

/**
 * For testing purposes only
 */
export function resetComponentContext() {
	currentContext = null;
}

export function provideComponentContext(internalInstance: ComponentInternalContext) {
	currentContext = internalInstance;

	return () => {
		currentContext = null;
	};
}

export function injectComponentContext(suppressWarning = false) {
	if (!suppressWarning && !currentContext)
		logger.warn('No component context was found. Did you used inject inside setup function?');

	return currentContext;
}
