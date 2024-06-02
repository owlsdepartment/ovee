import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App, AppConfigurator, ComponentsManager, createApp, ModulesManager } from '@/core';
import { EventDelegate } from '@/dom';
import { spyConsole, spyDomEvent } from '#/helpers';

describe('App', () => {
	let appConfig: AppConfigurator;
	let app: App;
	const _createApp = () => new App(appConfig, document.body);

	beforeEach(() => {
		appConfig = createApp();
		app = _createApp();
	});

	describe('constructor', () => {
		it('initializes managers and event delegate', () => {
			expect(app.componentsManager).toBeInstanceOf(ComponentsManager);
			expect(app.modulesManager).toBeInstanceOf(ModulesManager);
			expect(app.$eventDelegate).toBeInstanceOf(EventDelegate);
		});
	});

	describe('method:run', () => {
		it(`should display production tip via 'displayDevTip'`, () => {
			const infoSpy = spyConsole('info');
			const displaySpy = vi.spyOn(App.prototype, 'displayDevTip');

			app.run();

			expect(displaySpy).toBeCalled();
			displaySpy.mockRestore();
			infoSpy.mockRestore();
		});

		it(`should call 'run' on managers`, () => {
			const cSpy = vi.spyOn(ComponentsManager.prototype, 'run');
			const mSpy = vi.spyOn(ModulesManager.prototype, 'run');

			app.run();

			expect(cSpy).toBeCalled();
			expect(mSpy).toBeCalled();

			cSpy.mockRestore();
			mSpy.mockRestore();
		});

		it(`should bind listener to handle 'dom:updated' event`, () => {
			const eventName = 'ovee:dom:updated';
			const addEventSpy = vi.spyOn(app.rootElement, 'addEventListener');

			app.run();

			expect(addEventSpy).toBeCalledTimes(1);
			expect(addEventSpy.mock.calls[0][0]).toBe(eventName);
			expect(addEventSpy.mock.calls[0][1]).toBe(app.onDomUpdated);
		});

		it('should mark app as initialized and emit proper event', () => {
			const spyInitialized = spyDomEvent('ovee:initialized', document);

			app.run();

			expect(app.initialized).toBe(true);
			expect(spyInitialized).toBeCalled();
		});
	});

	describe('method:destroy', () => {
		it('should call destroy on managers if was already initialized', () => {
			const cSpy = vi.spyOn(ComponentsManager.prototype, 'destroy');
			const mSpy = vi.spyOn(ModulesManager.prototype, 'destroy');

			app.destroy();

			expect(cSpy).not.toBeCalled();
			expect(mSpy).not.toBeCalled();

			app.run();
			app.destroy();

			expect(cSpy).toBeCalled();
			expect(mSpy).toBeCalled();

			cSpy.mockRestore();
			mSpy.mockRestore();
		});

		it('should remove document event listener if was already initialized', () => {
			const eventName = 'ovee:dom:updated';
			const removeEventSpy = vi.spyOn(app.rootElement, 'removeEventListener');

			app.run();

			expect(removeEventSpy).not.toBeCalled();

			app.run();
			app.destroy();

			expect(removeEventSpy).toBeCalledTimes(1);
			expect(removeEventSpy.mock.calls[0][0]).toBe(eventName);
			expect(removeEventSpy.mock.calls[0][1]).toBe(app.onDomUpdated);
		});
	});

	describe('method:displayDevTip', () => {
		it('should log message when not in production mode or test mode', () => {
			const infoSpy = spyConsole('info');

			vi.stubEnv('NODE_ENV', 'production');
			app.displayDevTip();
			expect(infoSpy).not.toBeCalled();

			vi.stubEnv('NODE_ENV', 'test');
			app.displayDevTip();
			expect(infoSpy).not.toBeCalled();

			vi.stubEnv('NODE_ENV', 'development');
			app.displayDevTip();
			expect(infoSpy).toBeCalledTimes(1);
			expect(infoSpy.mock.calls[0][0]).toBeTypeOf('string');

			vi.unstubAllEnvs();
		});
	});

	describe('method:onDomUpdated', () => {
		it('should harvest components after synchronoous tasks', () => {
			vi.useFakeTimers();
			const harvestSpy = vi.spyOn(ComponentsManager.prototype, 'harvestComponents');

			app.onDomUpdated({ target: document.body } as unknown as Event);

			expect(harvestSpy).not.toBeCalled();

			vi.runAllTimers();

			expect(harvestSpy).toBeCalledTimes(1);

			harvestSpy.mockRestore();

			vi.useRealTimers();
		});
	});

	describe('proxy methods', () => {
		it(`should proxy 'getModule'`, () => {
			const getModuleSpy = vi
				.spyOn(ModulesManager.prototype, 'getModule')
				.mockImplementation((): any => {});
			const module = 'moduleName';

			app.getModule(module);

			expect(getModuleSpy).toHaveBeenNthCalledWith(1, module);
			getModuleSpy.mockRestore();
		});

		it(`should proxy '$on' and '$off'`, () => {
			const onSpy = vi.spyOn(EventDelegate.prototype, 'on').mockImplementation((): any => {});
			const offSpy = vi.spyOn(EventDelegate.prototype, 'off').mockImplementation((): any => {});

			const event = 'event';
			const cb = () => {};
			const options = {};

			app.$on(event, cb, options);
			app.$off(event, cb, options);

			expect(onSpy).toHaveBeenNthCalledWith(1, event, cb, options);
			expect(offSpy).toHaveBeenNthCalledWith(1, event, cb, options);
			onSpy.mockRestore();
			offSpy.mockRestore();
		});

		it(`should proxy '$emit'`, () => {
			const emitSpy = vi.spyOn(EventDelegate.prototype, 'emit').mockImplementation(() => {});

			const event = 'event';
			const details = {};

			app.$emit(event, details);

			expect(emitSpy).toHaveBeenNthCalledWith(1, event, details);
			emitSpy.mockRestore();
		});
	});
});
