import { injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onMounted');

export function onMounted(cb: () => void) {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('onMounted'));

		return;
	}

	instance.mountBus.on(cb);
}
