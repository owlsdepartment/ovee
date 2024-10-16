import { injectModuleContext } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onInit');

export function onInit(cb: () => void) {
	const instance = injectModuleContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('onInit'));

		return;
	}

	instance.initBus.on(cb);
}
