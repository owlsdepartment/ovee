import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onUnmounted');

export function onUnmounted(cb: () => void, silent = false) {
	const instance = injectComponentContext(true);

	if (!instance) {
		if (!silent) logger.warn(getNoContextWarning('onUnmounted'));

		return;
	}

	instance.unmountBus.on(cb);
}

export function tryOnUnmounted(cb: () => void) {
	onUnmounted(cb, true);
}
