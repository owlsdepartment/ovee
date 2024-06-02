import { describe, expect, it } from 'vitest';

import { useModule } from '@/composables';
import { App, createApp, defineComponent, defineModule } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('useModule');

describe('useModule', () => {
	const warnSpy = spyConsole('warn');

	describe('when used outside of module', () => {
		it('throws error', () => {
			expect(() => useModule('')).toThrow(loggerRegExp);
		});

		it('siltently returns null if missing context is allowed', () => {
			const m = useModule('', true);

			expect(warnSpy).not.toBeCalled();
			expect(m).toBeNull();
		});
	});

	describe('when module is not found', () => {
		it('throws error', () => {
			const component = defineComponent(() => {
				useModule('');
			});

			expect(() => {
				createComponent(component);
			}).toThrow(loggerRegExp);
		});

		it('siltently returns null if missing module is allowed', () => {
			let m: any;

			const component = defineComponent(() => {
				m = useModule('', true);
			});
			createComponent(component);

			expect(warnSpy).not.toBeCalled();
			expect(m).toBeNull();
		});
	});

	describe('when module is present', () => {
		it('returns requested module instance based on first argument', () => {
			const testModule = defineModule(() => ({}));
			const otherModule = defineModule(() => ({}));
			const appConfig = createApp().useMany({ testModule, otherModule });
			const app = new App(appConfig, document.body);
			const m1Instance = app.modulesManager.modules.get('testModule')?.instance;
			const m2Instance = app.modulesManager.modules.get('otherModule')?.instance;

			let m1;
			let m2;
			const component = defineComponent(() => {
				m1 = useModule('testModule');
				m2 = useModule(otherModule);
			});
			createComponent(component, { app });

			expect(m1).toBe(m1Instance);
			expect(m2).toBe(m2Instance);
		});
	});
});
