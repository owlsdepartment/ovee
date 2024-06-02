import { Logger } from '@/errors';
import { AnyObject, EventBus } from '@/utils';

import { ModuleContext, ModuleOptions } from './types';

export interface ModuleInternalContext<Options extends ModuleOptions = ModuleOptions>
	extends ModuleContext<Options> {
	instance?: AnyObject;
	initBus: EventBus;
	destroyBus: EventBus;
}

const logger = new Logger('moduleContext');

let currentContext: null | ModuleInternalContext = null;

/**
 * For testing purposes only
 */
export function resetModuleContext() {
	currentContext = null;
}

export function provideModuleContext(internalInstance: ModuleInternalContext) {
	currentContext = internalInstance;

	return () => {
		currentContext = null;
	};
}

export function injectModuleContext(suppressWarning = false) {
	if (!suppressWarning && !currentContext)
		logger.warn("No module context was found. Did you used inject inside module's setup function?");

	return currentContext;
}
