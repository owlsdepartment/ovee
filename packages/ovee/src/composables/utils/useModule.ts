import { AnyModule, GetModuleInstance, useApp } from '@/core';
import { Logger } from '@/errors';
import { getNoContextWarning } from '@/utils';

const logger = new Logger('useModule');

export function useModule<M extends AnyModule>(
	module: M | string,
	allowMissing?: boolean
): GetModuleInstance<M>;
export function useModule<M extends AnyModule>(
	module: M | string,
	allowMissing: true
): GetModuleInstance<M> | null;

export function useModule<M extends AnyModule>(
	module: M | string,
	allowMissing = false
): GetModuleInstance<M> | null {
	const app = useApp(true);

	if (!app) {
		const message = getNoContextWarning('useModule');

		if (!allowMissing) throw Error(logger.getMessage(message));

		return null;
	}

	try {
		return app.getModule(module).instance;
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Something went wrong when retrieving module';

		if (!allowMissing) {
			throw Error(logger.getMessage(message));
		}

		return null;
	}
}
