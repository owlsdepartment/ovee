import { injectComponentContext, injectModuleContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onDestroy');

export function onDestroy(cb: () => void, silent = false) {
	const moduleInstance = injectModuleContext(true);
	const componentInstance = injectComponentContext(true);

	if (!moduleInstance && !componentInstance) {
		if (!silent) logger.warn(getNoContextWarning('onDestroy'));

		return;
	}

	const bus = moduleInstance?.destroyBus || componentInstance?.unmountBus;

	bus?.on(cb);
}

export function tryOnDestroy(cb: () => void) {
	onDestroy(cb, true);
}
