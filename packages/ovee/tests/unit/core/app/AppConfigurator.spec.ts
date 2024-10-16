import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	App,
	Component,
	ComponentOptions,
	defineComponent,
	defineModule,
	Module,
	ModuleOptions,
} from '@/core';
import { AppConfigurator } from '@/core/app/AppConfigurator';
import { createLoggerRegExp, spyConsole } from '#/helpers';

declare module '@/core' {
	interface AppConfig {
		a: number;
		b: number;
	}
}

const loggerRegExp = createLoggerRegExp('createApp');

vi.mock('@/core/app/App');

describe('AppConfigurator', () => {
	const consoleWarn = spyConsole('warn');

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('stores received initial config', () => {
		const initConfig = {};
		const appConfig = new AppConfigurator(initConfig);

		expect(appConfig.config).toEqual(initConfig);
	});

	describe('method:updateConfig', () => {
		it('will merge stored config with received one', () => {
			const initConfig = { a: 1, b: 2 };
			const overrideConfig = { b: 3 };
			const appConfig = new AppConfigurator(initConfig);

			appConfig.updateConfig(overrideConfig);

			expect(appConfig.config).toEqual({ a: 1, b: 3 });
		});
	});

	describe('method:use', () => {
		let appConfig: AppConfigurator;

		beforeEach(() => {
			appConfig = new AppConfigurator({});
		});

		it('registers received module', () => {
			const module = defineModule(() => {});
			const options = {};
			const name1 = 'name1';
			const name2 = 'name2';

			appConfig.use(name1, module);
			appConfig.use(name2, module, options);

			expect(appConfig.registeredModules.size).toBe(2);

			expect(appConfig.registeredModules.get(name1)).toEqual({ name: name1, module });
			expect(appConfig.registeredModules.get(name2)).toEqual({ name: name2, module, options });
		});

		it('validates received module and options', () => {
			const fakeModule = (() => {}) as unknown as Module;
			const fakeOptions = 'string options' as unknown as ModuleOptions;
			const validModule = defineModule(() => {});
			const validOptions = {};
			const moduleName = 'name';

			appConfig.use('', fakeModule, validOptions);
			appConfig.use(moduleName, validModule, fakeOptions);

			expect(consoleWarn).toBeCalledTimes(2);
			expect(consoleWarn.mock.calls[0][0]).toMatch(loggerRegExp);
			expect(consoleWarn.mock.calls[1][0]).toMatch(loggerRegExp);

			expect(appConfig.registeredModules.size).toBe(1);
			expect(appConfig.registeredModules.get(moduleName)).toEqual({
				name: moduleName,
				module: validModule,
			});
		});
	});

	describe('method:useMany', () => {
		it(`passes proper arguments to 'use' method`, () => {
			const appConfig = new AppConfigurator({});
			const useSpy = vi.spyOn(appConfig, 'use');
			const m1 = defineModule(() => {});
			const m2 = defineModule(() => {});
			const m3 = defineModule(() => {});
			const options = {};

			appConfig.useMany({
				m1: m1,
				m2: [m2],
				m3: [m3, options],
			});

			expect(useSpy).toBeCalledTimes(3);

			expect(useSpy).toHaveBeenNthCalledWith(1, 'm1', m1, undefined);
			expect(useSpy).toHaveBeenNthCalledWith(2, 'm2', m2, undefined);
			expect(useSpy).toHaveBeenNthCalledWith(3, 'm3', m3, options);
		});
	});

	describe('method:component', () => {
		let appConfig: AppConfigurator;

		beforeEach(() => {
			appConfig = new AppConfigurator({});
		});

		it('registers received component', () => {
			const component = defineComponent(() => {});
			const options = {};
			const name1 = 'name1';
			const name2 = 'name2';

			appConfig.component(name1, component);
			appConfig.component(name2, component, options);

			expect(appConfig.registeredComponents.size).toBe(2);

			expect(appConfig.registeredComponents.get(name1)).toEqual({ name: name1, component });
			expect(appConfig.registeredComponents.get(name2)).toEqual({
				name: name2,
				component,
				options,
			});
		});

		it('validates received component and options', () => {
			const fakeComponent = (() => {}) as unknown as Component;
			const fakeOptions = 'string options' as unknown as ComponentOptions;
			const validComponent = defineComponent(() => {});
			const validOptions = {};
			const componentName = 'name';

			appConfig.component('', fakeComponent, validOptions);
			appConfig.component(componentName, validComponent, fakeOptions);

			expect(consoleWarn).toBeCalledTimes(2);
			expect(consoleWarn.mock.calls[0][0]).toMatch(loggerRegExp);
			expect(consoleWarn.mock.calls[1][0]).toMatch(loggerRegExp);

			expect(appConfig.registeredComponents.size).toBe(1);
			expect(appConfig.registeredComponents.get(componentName)).toEqual({
				name: componentName,
				component: validComponent,
			});
		});
	});

	describe('method:run', () => {
		it(`calls 'run' on the app and returns app instance`, () => {
			const runSpy = vi.mocked(App.prototype.run);
			const appConfig = new AppConfigurator({});
			const root = document.body;

			const app = appConfig.run(root);

			expect(runSpy).toHaveBeenNthCalledWith(1);
			expect(app).toBeInstanceOf(App);
		});

		it(`calls 'run' only when document is loaded`, () => {
			let savedListener: CallableFunction;
			const myDocument = {
				addEventListener: vi.fn((name, cb) => (savedListener = cb)),
				readyState: 'loading',
			} as unknown as Document;
			const appConfig = new AppConfigurator({ document: myDocument });
			const runSpy = vi.mocked(App.prototype.run);

			appConfig.run(document.body);

			expect(runSpy).not.toHaveBeenCalled();

			(myDocument as any).readyState = 'complete';
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			savedListener?.();

			expect(runSpy).toHaveBeenCalledTimes(1);
		});
	});
});
