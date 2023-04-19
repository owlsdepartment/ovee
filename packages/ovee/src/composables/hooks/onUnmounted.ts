import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onUnmounted');

export function onUnmounted(cb: () => void) {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('onUnmounted'));

		return;
	}

	instance.unmountBus.on(cb);
}
