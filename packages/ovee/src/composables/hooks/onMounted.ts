import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onMounted');

export function onMounted(cb: () => void, silent = false) {
	const instance = injectComponentContext(true);

	if (!instance) {
		if (!silent) logger.warn(getNoContextWarning('onMounted'));

		return;
	}

	instance.mountBus.on(cb);
}

export function tryOnMounted(cb: () => void) {
	onMounted(cb, true);
}
