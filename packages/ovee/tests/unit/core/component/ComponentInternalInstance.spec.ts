import { getCurrentScope, onScopeDispose } from '@vue/reactivity';
import { describe, expect, it, vi } from 'vitest';

import { defineComponent, HTMLOveeElement } from '@/core';
import { Task } from '@/utils';
import { createComponent, injectComponentContext } from '#/helpers';
import { flushPromises } from '#/helpers/global';

// TODO: test effect scope usage

describe('ComponentInternalInstance', () => {
	const el = document.createElement('div');
	const component = defineComponent(() => {});
	const options = {};

	describe('constructor', () => {
		it('calls setup function with element and context', () => {
			const setupFn = vi.fn();
			const component = defineComponent(setupFn);
			const instance = createComponent(component, { element: el, options });

			expect(setupFn).toBeCalledTimes(1);
			expect(setupFn.mock.calls[0][0]).toBe(el);
			expect(setupFn.mock.calls[0][1]).toBeTypeOf('object');
			expect(setupFn.mock.calls[0][1].options).toBe(options);
			expect(setupFn.mock.calls[0][1].app).toBe(instance.app);
			expect(setupFn.mock.calls[0][1].emit).toBeTypeOf('function');
			expect(setupFn.mock.calls[0][1].on).toBeTypeOf('function');
			expect(setupFn.mock.calls[0][1].off).toBeTypeOf('function');
		});

		it('saves returned object as component instance', () => {
			const setupInstance = {};
			const component = defineComponent(() => setupInstance);

			const instance = createComponent(component);

			expect(instance.instance).toBe(setupInstance);
		});

		it('provides itself as a component context in setup function', () => {
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

		it("saves it's instance on the connected element", () => {
			const instance = createComponent(component);
			const element = instance.element as HTMLOveeElement;

			expect(element._OveeComponentInstances).toBeInstanceOf(Array);
			expect(element._OveeComponentInstances![0]).toBe(instance);
		});

		it('preserves other components instances', () => {
			const i1 = {} as any;
			const i2 = {} as any;
			const element = document.createElement('div') as HTMLOveeElement;
			element._OveeComponentInstances = [i1, i2];

			const instance = createComponent(component, { element });

			expect(element._OveeComponentInstances?.length).toBe(3);
			expect(element._OveeComponentInstances).toStrictEqual([i1, i2, instance]);
		});

		it(`emits 'beforeMountBus' constructor executed`, () => {
			const onBeforeMount = vi.fn();
			const component = defineComponent(() => {
				const instance = injectComponentContext(true);

				instance?.beforeMountBus.on(onBeforeMount);
			});

			createComponent(component, {}, false);

			expect(onBeforeMount).toBeCalledTimes(1);
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

		it('delays mount, if there is a pending renderPromise', async () => {
			const onMount = vi.fn();
			const component = defineComponent(() => {
				const instance = injectComponentContext(true);

				instance?.mountBus.on(onMount);
			});
			const instance = createComponent(component, {}, false);
			const renderTask = new Task();

			instance.renderPromise = renderTask;
			instance.mount();

			expect(onMount).not.toBeCalled();

			renderTask.resolve();
			await flushPromises();

			expect(onMount).toBeCalledTimes(1);
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

	it(`integrates Vue's effectScope in components lifecycle`, () => {
		let scope: any = undefined;
		const onScopeDisposeCb = vi.fn();
		const component = defineComponent(() => {
			scope = getCurrentScope();

			onScopeDispose(onScopeDisposeCb);
		});

		const instance = createComponent(component);

		instance.unmount();

		expect(scope).not.toBeUndefined();
		expect(onScopeDisposeCb).toBeCalledTimes(1);
	});
});
