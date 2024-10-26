import { injectComponentContext, injectModuleContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onInit');

export function onInit(cb: () => void, silent = false) {
	const moduleInstance = injectModuleContext(true);
	const componentInstance = injectComponentContext(true);

	if (!moduleInstance && !componentInstance) {
		if (!silent) logger.warn(getNoContextWarning('onInit'));

		return;
	}

	const bus = moduleInstance?.initBus || componentInstance?.mountBus;

	bus?.on(cb);
}

export function tryOnInit(cb: () => void) {
	onInit(cb, true);
}
