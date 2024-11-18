import { Logger } from '@/errors';

import { ComponentInstance } from './types';

const logger = new Logger('componentContext');

let currentContext: null | ComponentInstance = null;

/**
 * For testing purposes only
 */
export function resetComponentContext() {
	currentContext = null;
}

export function provideComponentContext(internalInstance: ComponentInstance) {
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
