import { describe, expect, it, vi } from 'vitest';

import { defineModule } from '@/core';
import { createModule, injectModuleContext } from '#/helpers';

describe('ModuleInternalInstance', () => {
	const module = defineModule(() => {});
	const options = {};

	describe('constructor', () => {
		it('calls setup function with app and options', () => {
			const setupFn = vi.fn();
			const module = defineModule(setupFn);
			const instance = createModule(module, { options });

			expect(setupFn).toBeCalledTimes(1);
			expect(setupFn.mock.calls[0][0]).toBeTypeOf('object');
			expect(setupFn.mock.calls[0][0].options).toBe(options);
			expect(setupFn.mock.calls[0][0].app).toBe(instance.app);
		});

		it('saves returned object as component instance', () => {
			const setupInstance = {};
			const module = defineModule(() => setupInstance);

			const instance = createModule(module);

			expect(instance.instance).toBe(setupInstance);
		});

		it('provides itself as a module context in setup function', () => {
			const testFn = vi.fn();
			const module = defineModule(() => {
				const ctx = injectModuleContext();

				testFn(ctx);
			});
			const instance = createModule(module);

			expect(testFn).toHaveBeenNthCalledWith(1, instance);
		});

		it('cleans up provided context', () => {
			expect(injectModuleContext(true)).toBeNull();

			createModule(module);

			expect(injectModuleContext(true)).toBeNull();
		});
	});

	describe('init:method', () => {
		it(`calls 'emit' from initBus`, () => {
			const instance = createModule(module, {}, false);
			const emitSpy = vi.spyOn(instance.initBus, 'emit');

			instance.init();

			expect(emitSpy).toBeCalledTimes(1);
		});

		it('emits only 1 event, even if called multiple times, until is destroyed', () => {
			const instance = createModule(module, {}, false);
			const emitSpy = vi.spyOn(instance.initBus, 'emit');

			instance.init();
			instance.init();
			instance.init();
			instance.init();

			expect(emitSpy).toBeCalledTimes(1);

			instance.destroy();
			instance.init();

			expect(emitSpy).toBeCalledTimes(2);
		});
	});

	describe('destroy:method', () => {
		it(`calls 'emit' from destroyBus`, () => {
			const instance = createModule(module, {});
			const emitSpy = vi.spyOn(instance.destroyBus, 'emit');

			instance.destroy();

			expect(emitSpy).toBeCalledTimes(1);
		});

		it('emits only 1 event, even if called multiple times, until is initialized again', () => {
			const instance = createModule(module, {});
			const emitSpy = vi.spyOn(instance.destroyBus, 'emit');

			instance.destroy();
			instance.destroy();
			instance.destroy();
			instance.destroy();

			expect(emitSpy).toBeCalledTimes(1);

			instance.init();
			instance.destroy();

			expect(emitSpy).toBeCalledTimes(2);
		});
	});
});
