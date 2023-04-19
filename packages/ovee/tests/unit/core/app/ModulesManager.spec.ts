import { assertType, beforeEach, describe, expect, it, vi } from 'vitest';

import { App, AppConfigurator, createApp, defineModule, ModulesManager } from '@/core';
import { ModuleInternalInstance } from '@/core/module';
import { createLoggerRegExp } from '#/helpers';

vi.mock('@/core/app/App', () => {
	return {
		App: class {
			constructor(public configurator: AppConfigurator) {}
		},
	};
});

vi.mock('@/core/module/ModuleInternalInstance');

const loggerRegExp = createLoggerRegExp('App');

describe('ModulesManager', () => {
	let appConfig: AppConfigurator;
	let app: App;
	let manager: ModulesManager;
	const _createApp = () => new App(appConfig, document.body);
	const _ModuleInternalInstance = vi.mocked(ModuleInternalInstance);
	const m2Options = { a: 'test' };
	const m1 = defineModule(() => {});
	const m2 = defineModule<{ a: string }, { return: boolean }>(() => ({ return: true }));

	beforeEach(() => {
		appConfig = createApp();
		appConfig.useMany({ m1, m2: [m2, m2Options] });
		app = _createApp();
		manager = new ModulesManager(app);
		_ModuleInternalInstance.mockClear();

		return () => {
			manager.destroy();
		};
	});

	describe('constructor', () => {
		it('should create modules', () => {
			const manager = new ModulesManager(app);

			expect(manager.modules.size).toBe(2);
			expect(_ModuleInternalInstance).toBeCalledTimes(2);

			expect(_ModuleInternalInstance).toHaveBeenNthCalledWith(1, app, m1, {});
			expect(_ModuleInternalInstance).toHaveBeenNthCalledWith(2, app, m2, m2Options);
		});
	});

	describe('method:run', () => {
		it('should call init on created modules', () => {
			const spies = Array.from(manager.modules.values()).map(m => vi.spyOn(m, 'init'));

			manager.run();

			spies.forEach(spy => {
				expect(spy).toBeCalledTimes(1);
			});
		});
	});

	describe('method:destroy', () => {
		it('should call init on created modules', () => {
			const spies = Array.from(manager.modules.values()).map(m => vi.spyOn(m, 'destroy'));

			manager.destroy();

			spies.forEach(spy => {
				expect(spy).toBeCalledTimes(1);
			});
		});
	});

	describe('method:getModule', () => {
		it('returns proper module instance and options via name or module itself', () => {
			const manager = new ModulesManager(app);
			const m1Instance = _ModuleInternalInstance.mock.instances[0];
			const m2Instance = _ModuleInternalInstance.mock.instances[1];

			const m1Result = manager.getModule('m1');
			const m2Result = manager.getModule(m2);

			expect(m1Instance.instance).toBe(m1Result.instance);
			expect(m1Instance.options).toBe(m1Result.options);
			expect(m2Instance.instance).toBe(m2Result.instance);
			expect(m2Instance.options).toBe(m2Result.options);
		});

		it('properly infers instance and return type based on passed module', () => {
			const m1Module = manager.getModule(m1);
			const m2Module = manager.getModule(m2);

			assertType<{}>(m1Module.instance);
			assertType<{}>(m1Module.options);

			assertType<{ return: boolean }>(m2Module.instance);
			assertType<{ a?: string }>(m2Module.options);
		});

		it('throws an error when unregistered module or module name is passed', () => {
			const m = defineModule(() => {});

			expect(() => manager.getModule(m)).toThrow(loggerRegExp);
			expect(() => manager.getModule('not-existing')).toThrow(loggerRegExp);
		});
	});
});
