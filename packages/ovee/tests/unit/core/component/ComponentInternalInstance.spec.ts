import { describe, expect, it, vi } from 'vitest';

import { defineComponent } from '@/core';
import { createComponent, injectComponentContext } from '#/helpers';

describe('ComponentInternalInstance', () => {
	const el = document.createElement('div');
	const component = defineComponent(() => {});
	const options = {};

	describe('constructor', () => {
		it('calls setup function with element and options', () => {
			const setupFn = vi.fn();
			const component = defineComponent(setupFn);

			createComponent(component, { element: el, options });

			expect(setupFn).toBeCalledTimes(1);
			expect(setupFn).toHaveBeenNthCalledWith(1, el, options);
		});

		it('saves returned object as component instance', () => {
			const setupInstance = {};
			const component = defineComponent(() => setupInstance);

			const instance = createComponent(component);

			expect(instance.instance).toBe(setupInstance);
		});

		it.only('provides itself as a component context in setup function', () => {
			const testFn = vi.fn();
			const component = defineComponent(() => {
				const ctx = injectComponentContext();

				testFn(ctx);
			});
			const instance = createComponent(component);

			expect(testFn).toHaveBeenNthCalledWith(1, instance);
		});

		it('cleans up provided context', () => {
			expect(injectComponentContext(true)).toBeNull();

			createComponent(component);

			expect(injectComponentContext(true)).toBeNull();
		});
	});

	describe('mount:method', () => {
		it(`calls 'emit' from mountBus`, () => {
			const instance = createComponent(component, {}, false);
			const emitSpy = vi.spyOn(instance.mountBus, 'emit');

			instance.mount();

			expect(emitSpy).toBeCalledTimes(1);
		});

		it('emits only 1 event, even if called multiple times, until is unmounted', () => {
			const instance = createComponent(component, {}, false);
			const emitSpy = vi.spyOn(instance.mountBus, 'emit');

			instance.mount();
			instance.mount();
			instance.mount();
			instance.mount();

			expect(emitSpy).toBeCalledTimes(1);

			instance.unmount();
			instance.mount();

			expect(emitSpy).toBeCalledTimes(2);
		});
	});

	describe('unmount:method', () => {
		it(`calls 'emit' from unmountBus`, () => {
			const instance = createComponent(component, {});
			const emitSpy = vi.spyOn(instance.unmountBus, 'emit');

			instance.unmount();

			expect(emitSpy).toBeCalledTimes(1);
		});

		it('emits only 1 event, even if called multiple times, until is mounted again', () => {
			const instance = createComponent(component, {});
			const emitSpy = vi.spyOn(instance.unmountBus, 'emit');

			instance.unmount();
			instance.unmount();
			instance.unmount();
			instance.unmount();

			expect(emitSpy).toBeCalledTimes(1);

			instance.mount();
			instance.unmount();

			expect(emitSpy).toBeCalledTimes(2);
		});
	});

	describe('on:method', () => {
		it(`proxies call to EventDelegate's on`, () => {
			const instance = createComponent(component);
			const onSpy = vi.spyOn(instance.eventDelegate, 'on');
			const ev = 'test';
			const cb = () => {};
			const opt = {};

			instance.on(ev, cb, opt);

			expect(onSpy).toBeCalledTimes(1);
			expect(onSpy).toHaveBeenNthCalledWith(1, ev, cb, opt);
		});
	});

	describe('off:method', () => {
		it(`proxies call to EventDelegate's off`, () => {
			const instance = createComponent(component);
			const offSpy = vi.spyOn(instance.eventDelegate, 'off');
			const ev = 'test';
			const cb = () => {};
			const opt = {};

			instance.off(ev, cb, opt);

			expect(offSpy).toBeCalledTimes(1);
			expect(offSpy).toHaveBeenNthCalledWith(1, ev, cb, opt);
		});
	});

	describe('emit:method', () => {
		it(`proxies call to EventDelegate's off`, () => {
			const instance = createComponent(component);
			const emitSpy = vi.spyOn(instance.eventDelegate, 'emit');
			const ev = 'test';
			const opt = {};

			instance.emit(ev, opt);

			expect(emitSpy).toBeCalledTimes(1);
			expect(emitSpy).toHaveBeenNthCalledWith(1, ev, opt);
		});
	});
});
