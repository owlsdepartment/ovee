import { beforeEach, describe, expect, it } from 'vitest';

import {
	injectModuleContext,
	provideModuleContext,
	resetModuleContext,
} from '@/core/module/moduleContext';
import { createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('moduleContext');

describe('moduleContext', () => {
	const warnSpy = spyConsole('warn');

	beforeEach(() => {
		resetModuleContext();
	});

	it('it returns saved context', () => {
		const context = {};

		provideModuleContext(context as any);
		const returnedCtx = injectModuleContext();

		expect(returnedCtx).toBe(context);
	});

	it(`returns 'null' if no context was provided`, () => {
		expect(injectModuleContext()).toBe(null);
	});

	it('returns callback to clear provided context', () => {
		const context = {};
		const clear = provideModuleContext(context as any);

		clear();
		const returnedCtx = injectModuleContext();

		expect(returnedCtx).toBe(null);
	});

	it('should log warning if no context was found', () => {
		injectModuleContext();

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});

	it(`should not log anything if 'suppressWarning' is set to true`, () => {
		injectModuleContext(true);

		expect(warnSpy).not.toBeCalled();
	});
});
