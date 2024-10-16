import { injectComponentContext } from '@/core/component';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('onBeforeMount');

export function onBeforeMount(cb: () => void) {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('onBeforeMount'));

		return;
	}

	instance.beforeMountBus.on(cb);
}
