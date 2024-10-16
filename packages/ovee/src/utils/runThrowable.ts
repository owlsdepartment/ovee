import { Logger } from '@/errors';

import { isString } from './typeChecking';

export function runThrowable<R>(
	what: string,
	cb: (...args: any[]) => R,
	log: string | Logger = ''
): R | void {
	try {
		return cb();
	} catch (e) {
		const logger = isString(log) ? new Logger(log) : log;

		logger.error(`There was unexpected error while running ${what}`, e);
	}
}
