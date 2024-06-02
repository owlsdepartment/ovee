import { beforeEach, describe, expect, it } from 'vitest';

import { injectComponentContext, provideComponentContext } from '@/core/Component';
import { resetComponentContext } from '@/core/Component/componentContext';
import { createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('componentContext');

describe('componentContext', () => {
	const warnSpy = spyConsole('warn');

	beforeEach(() => {
		resetComponentContext();
	});

	it('it returns saved context', () => {
		const context = {};

		provideComponentContext(context as any);
		const returnedCtx = injectComponentContext();

		expect(returnedCtx).toBe(context);
	});

	it(`returns 'null' if no context was provided`, () => {
		expect(injectComponentContext()).toBe(null);
	});

	it('returns callback to clear provided context', () => {
		const context = {};
		const clear = provideComponentContext(context as any);

		clear();
		const returnedCtx = injectComponentContext();

		expect(returnedCtx).toBe(null);
	});

	it('should log warning if no context was found', () => {
		injectComponentContext();

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});

	it(`should not log anything if 'suppressWarning' is set to true`, () => {
		injectComponentContext(true);

		expect(warnSpy).not.toBeCalled();
	});
});
