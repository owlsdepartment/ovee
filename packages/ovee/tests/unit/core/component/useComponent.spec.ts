import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App, AppConfigurator, createApp } from '@/core';
import { ComponentContext, provideComponentContext, useComponent } from '@/core/component';
import { resetComponentContext } from '@/core/component/componentContext';
import { createLoggerRegExp } from '#/helpers';

const loggerRegExp = createLoggerRegExp('useComponent');

describe('useComponent', () => {
	let appConfig: AppConfigurator;
	let app: App;
	let context: ComponentContext;
	const element = document.createElement('div');
	const options = {};
	const _createApp = () => new App(appConfig, document.body);

	beforeEach(() => {
		appConfig = createApp();
		app = _createApp();
		context = {
			app,
			element,
			options,
			emit: vi.fn(),
			on: vi.fn(),
			off: vi.fn(),
		} as any as ComponentContext;
	});

	beforeEach(() => {
		resetComponentContext();
	});

	it('should throw error, when used without existing context', () => {
		expect(() => useComponent()).toThrow(loggerRegExp);
	});

	it(`should return 'null' when 'allowMissingContext' is set to true`, () => {
		const ctx = useComponent(true);

		expect(ctx).toBeNull();
	});

	it('should return proper instance fields', () => {
		provideComponentContext(context);

		const ctx = useComponent();

		expect(ctx.app).toBe(app);
		expect(ctx.element).toBe(element);
		expect(ctx.options).toEqual(options);
	});

	describe('methods proxy', () => {
		beforeEach(() => {
			provideComponentContext(context);
		});

		it('should proxy emit', () => {
			const ctx = useComponent();
			const ev = 'event';
			const detail = {};

			ctx.emit(ev, detail);

			expect(context.emit).toBeCalledTimes(1);
			expect(context.emit).toHaveBeenNthCalledWith(1, ev, detail);
		});

		it('should proxy on', () => {
			const ctx = useComponent();
			const ev = 'event';
			const cb = () => {};
			const options = {};

			ctx.on(ev, cb, options);

			expect(context.on).toBeCalledTimes(1);
			expect(context.on).toHaveBeenNthCalledWith(1, ev, cb, options);
		});

		it('should proxy off', () => {
			const ctx = useComponent();
			const ev = 'event';
			const cb = () => {};
			const options = {};

			ctx.off(ev, cb, options);

			expect(context.off).toBeCalledTimes(1);
			expect(context.off).toHaveBeenNthCalledWith(1, ev, cb, options);
		});
	});
});
