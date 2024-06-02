import { nextTick, watch } from '@vue/runtime-core';
import { describe, expect, it, vi } from 'vitest';

import { useQueryComponent, useQueryComponentAll } from '@/composables';
import { defineComponent, HTMLOveeElement } from '@/core';
import { OveeReadonlyRef } from '@/utils';
import {
	createComponent,
	createLoggerRegExp,
	createTestApp,
	spyConsole,
	useDOMCleanup,
} from '#/helpers';

describe('useQueryComponent', () => {
	const warnSpy = spyConsole('warn');
	const component1 = defineComponent(() => {});
	const component2 = defineComponent(() => {});
	const _app = createTestApp(config => {
		config.component('component-1', component1);
		config.component('component-2', component2);
	});

	useDOMCleanup();

	describe('single', () => {
		const loggerRegExp = createLoggerRegExp('useQueryComponent');

		it('warns user, when used outside of a component', () => {
			useQueryComponent('');

			expect(warnSpy).toBeCalledTimes(1);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
		});

		it('logs warning, if passed component is not yet registered', () => {
			let missingRef: OveeReadonlyRef<any>, testRef: OveeReadonlyRef<any>;
			const testComp = defineComponent(() => {});
			const component = defineComponent(() => {
				missingRef = useQueryComponent('missing');
				testRef = useQueryComponent(testComp);
			});
			createComponent(component);

			expect(warnSpy).toBeCalledTimes(2);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
			expect(warnSpy.mock.calls[1][0]).toMatch(loggerRegExp);
			expect(missingRef!.value).toBe(undefined);
			expect(testRef!.value).toBe(undefined);
		});

		it("returns dynamic ref with current value of a nested component's instance and is reactive", async () => {
			let stringRef: OveeReadonlyRef<any>, componentRef: OveeReadonlyRef<any>;
			const watchFn = vi.fn();

			const component = defineComponent(() => {
				stringRef = useQueryComponent('component-1');
				componentRef = useQueryComponent(component2);

				watch(() => stringRef.value, watchFn);
				watch(() => componentRef.value, watchFn);
			});
			const element = document.createElement('div');
			document.body.append(element);

			createComponent(component, { app: _app.app, element });

			await nextTick();

			expect(stringRef!.value).toBeUndefined();
			expect(componentRef!.value).toBeUndefined();
			expect(watchFn).not.toBeCalled();

			element.innerHTML = `
				<component-1 id="t1"></component-1>
				<div data-component-2 id="t2"></div>
			`;

			const c1Instance = getComponentsFirstInstance('#t1');
			const c2Instance = getComponentsFirstInstance('#t2');

			await nextTick();

			expect(stringRef!.value).toBeDefined();
			expect(componentRef!.value).toBeDefined();
			expect(stringRef!.value).toBe(c1Instance);
			expect(componentRef!.value).toBe(c2Instance);
			expect(watchFn).toBeCalledTimes(2);

			element.innerHTML = ``;

			await nextTick();

			expect(stringRef!.value).toBeUndefined();
			expect(componentRef!.value).toBeUndefined();
			expect(watchFn).toBeCalledTimes(4);
		});

		it('serves as a one time helper when target is passed as an additional argument', () => {
			let stringRef: OveeReadonlyRef<any>, componentRef: OveeReadonlyRef<any>;

			const component = defineComponent(() => {
				stringRef = useQueryComponent('component-1', document.documentElement);
				componentRef = useQueryComponent(component2, document.documentElement);
			});
			const element = document.createElement('div');
			element.innerHTML = `
				<component-1 id="t1"></component-1>
				<div data-component-2 id="t2"></div>
			`;
			document.body.append(element);

			createComponent(component, { app: _app.app, element });

			const c1Instance = getComponentsFirstInstance('#t1');
			const c2Instance = getComponentsFirstInstance('#t2');

			expect(stringRef!.value).toBeDefined();
			expect(componentRef!.value).toBeDefined();
			expect(stringRef!.value).toBe(c1Instance);
			expect(componentRef!.value).toBe(c2Instance);

			element.innerHTML = '';

			expect(stringRef!.value).toBeDefined();
			expect(componentRef!.value).toBeDefined();
		});
	});

	describe('multiple', () => {
		const loggerRegExp = createLoggerRegExp('useQueryComponentAll');

		it('warns user, when used outside of a component', () => {
			useQueryComponentAll('');

			expect(warnSpy).toBeCalledTimes(1);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
		});

		it('logs warning, if passed component is not yet registered', () => {
			let missingRef: OveeReadonlyRef<any>, testRef: OveeReadonlyRef<any>;
			const testComp = defineComponent(() => {});
			const component = defineComponent(() => {
				missingRef = useQueryComponentAll('missing');
				testRef = useQueryComponentAll(testComp);
			});
			createComponent(component);

			expect(warnSpy).toBeCalledTimes(2);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
			expect(warnSpy.mock.calls[1][0]).toMatch(loggerRegExp);
			expect(missingRef!.value).toEqual([]);
			expect(testRef!.value).toEqual([]);
		});

		it("returns dynamic ref array with all current values of a nested component's instances and is reactive", async () => {
			let stringRef: OveeReadonlyRef<any[]>, componentRef: OveeReadonlyRef<any[]>;
			const watchFn = vi.fn();

			const component = defineComponent(() => {
				stringRef = useQueryComponentAll('component-1');
				componentRef = useQueryComponentAll(component2);

				watch(() => stringRef.value, watchFn);
				watch(() => componentRef.value, watchFn);
			});
			const element = document.createElement('div');
			document.body.append(element);

			createComponent(component, { app: _app.app, element });

			await nextTick();

			expect(stringRef!.value).toEqual([]);
			expect(componentRef!.value).toEqual([]);
			expect(watchFn).not.toBeCalled();

			element.innerHTML = `
				<component-1 id="t1"></component-1>
				<component-2 id="t2"></component-2>
				<div data-component-1 id="t3"></div>
				<div data-component-2 id="t4"></div>
			`;

			const c1Instance1 = getComponentsFirstInstance('#t1');
			const c1Instance2 = getComponentsFirstInstance('#t3');
			const c2Instance1 = getComponentsFirstInstance('#t2');
			const c2Instance2 = getComponentsFirstInstance('#t4');

			await nextTick();

			expect(stringRef!.value.length).toBe(2);
			expect(componentRef!.value.length).toBe(2);
			expect(stringRef!.value[0]).toBe(c1Instance1);
			expect(stringRef!.value[1]).toBe(c1Instance2);
			expect(componentRef!.value[0]).toBe(c2Instance1);
			expect(componentRef!.value[1]).toBe(c2Instance2);
			expect(watchFn).toBeCalledTimes(2);

			element.innerHTML = ``;

			await nextTick();

			expect(stringRef!.value).toEqual([]);
			expect(componentRef!.value).toEqual([]);
			expect(watchFn).toBeCalledTimes(4);
		});

		it('serves as a one time helper when target is passed as an additional argument', () => {
			let stringRef: OveeReadonlyRef<any[]>, componentRef: OveeReadonlyRef<any[]>;

			const component = defineComponent(() => {
				stringRef = useQueryComponentAll('component-1', document.documentElement);
				componentRef = useQueryComponentAll(component2, document.documentElement);
			});
			const element = document.createElement('div');
			element.innerHTML = `
				<component-1 id="t1"></component-1>
				<component-2 id="t2"></component-2>
				<div data-component-1 id="t3"></div>
				<div data-component-2 id="t4"></div>
			`;
			document.body.append(element);

			createComponent(component, { app: _app.app, element });

			const c1Instance1 = getComponentsFirstInstance('#t1');
			const c1Instance2 = getComponentsFirstInstance('#t3');
			const c2Instance1 = getComponentsFirstInstance('#t2');
			const c2Instance2 = getComponentsFirstInstance('#t4');

			expect(stringRef!.value.length).toBe(2);
			expect(componentRef!.value.length).toBe(2);
			expect(stringRef!.value[0]).toBe(c1Instance1);
			expect(stringRef!.value[1]).toBe(c1Instance2);
			expect(componentRef!.value[0]).toBe(c2Instance1);
			expect(componentRef!.value[1]).toBe(c2Instance2);

			element.innerHTML = '';

			expect(stringRef!.value.length).toBe(2);
			expect(componentRef!.value.length).toBe(2);
		});
	});
});

function getComponentsFirstInstance(selector: string) {
	return document.querySelector<HTMLOveeElement>(selector)?._OveeComponentInstances?.[0]?.instance;
}
