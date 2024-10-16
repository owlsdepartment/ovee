import { injectModuleContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onDestroy');

export function onDestroy(cb: () => void) {
	const instance = injectModuleContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('onDestroy'));

		return;
	}

	instance.destroyBus.on(cb);
}
