import { MaybeMocked, MaybeMockedDeep } from '@vitest/spy';
import { Component } from '@vue/runtime-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	App,
	AppConfigurator,
	ComponentInternalInstance,
	ComponentOptions,
	ComponentsManager,
	createApp,
	defineComponent,
	HTMLOveeElement,
} from '@/core';
import { ComponentFactory, setupComponent, StoredComponent } from '@/core/setupComponent';
import { attachMutationObserver } from '@/utils';

vi.mock('@/core/app/App', () => {
	return {
		App: class {
			constructor(public configurator: AppConfigurator, public rootElement: HTMLElement) {}
		},
	};
});

vi.mock('@/utils/attachMutationObserver');

vi.mock('@/core/setupComponent', () => {
	const setupComponent = vi.fn(
		(app: App, name: string, component: Component, _options?: ComponentOptions) => {
			const options = _options || {};

			return {
				name,
				component,
				options,

				factory: vi.fn(() => {
					return {
						mount: vi.fn(),
						unmount: vi.fn(),
					};
				}),
			};
		}
	);

	return {
		setupComponent,
	};
});

describe('ComponentsManager', () => {
	let appConfig: AppConfigurator;
	let app: App;
	let manager: ComponentsManager;
	const _createApp = () => new App(appConfig, document.body);
	const _setupComponent = vi.mocked(setupComponent);
	const _attachMutationObserver = vi.mocked(attachMutationObserver);
	const c1 = defineComponent(() => {});
	const c2 = defineComponent<{ a: string }>(() => {});
	const c3 = defineComponent<{ a: string }>(() => ({ b: true }));
	const c3Options = { a: '' };

	beforeEach(() => {
		appConfig = createApp();
		appConfig.component('c1', c1);
		appConfig.components({ c2, c3: [c3, c3Options] });
		app = _createApp();
		document.body.innerHTML = '';
		manager = new ComponentsManager(app);
		_setupComponent.mockClear();
		_attachMutationObserver.mockClear();

		return () => {
			manager.destroy();
		};
	});

	describe('constructor', () => {
		it('should setup components', () => {
			const manager = new ComponentsManager(app);

			expect(manager.storedComponents.size).toBe(3);
			expect(_setupComponent).toHaveBeenCalledTimes(3);

			expect(_setupComponent).toHaveBeenNthCalledWith(1, app, 'c1', c1, undefined);
			expect(_setupComponent).toHaveBeenNthCalledWith(2, app, 'c2', c2, undefined);
			expect(_setupComponent).toHaveBeenNthCalledWith(3, app, 'c3', c3, c3Options);
		});
	});

	describe('method:run', () => {
		const harvestComponentsSpy = vi.spyOn(ComponentsManager.prototype, 'harvestComponents');

		beforeEach(() => {
			harvestComponentsSpy.mockClear();
		});

		it('should harvest components on root element', () => {
			manager.run();

			expect(harvestComponentsSpy).toHaveBeenCalledTimes(1);
		});

		it('should attach mutation observer to root element', () => {
			manager.run();

			expect(_attachMutationObserver).toHaveBeenCalledTimes(1);
			expect(_attachMutationObserver.mock.calls[0][0]).toBe(app.rootElement);
			expect(_attachMutationObserver.mock.calls[0][1]).toBeTypeOf('function');
			expect(_attachMutationObserver.mock.calls[0][2]).toBeTypeOf('function');
		});

		describe('-> mutation observer', () => {
			it(`should harvest components only on HTMLElements, which were added`, () => {
				manager.run();
				harvestComponentsSpy.mockClear();

				const addCallback = _attachMutationObserver.mock.calls[0][1];
				const nodes = [
					document.createElement('div'),
					document.createComment(''),
					document.createElement('a'),
				];

				addCallback(nodes);

				expect(harvestComponentsSpy).toBeCalledTimes(2);
				expect(harvestComponentsSpy).toHaveBeenNthCalledWith(1, nodes[0]);
				expect(harvestComponentsSpy).toHaveBeenNthCalledWith(2, nodes[2]);
			});

			it(`should destroy components only on HTMLElements, which were removed`, () => {
				const destroyComponentsSpy = vi.spyOn(ComponentsManager.prototype, 'destroyComponents');

				manager.run();

				const removeCallback = _attachMutationObserver.mock.calls[0][2];
				const nodes = [
					document.createElement('div'),
					document.createComment(''),
					document.createElement('a'),
					document.createElement('p'),
				];
				const tmpParent = document.createElement('div');
				tmpParent.append(nodes[2]); // simulate moving an element to another place

				removeCallback(nodes);

				expect(destroyComponentsSpy).toBeCalledTimes(2);
				expect(destroyComponentsSpy).toHaveBeenNthCalledWith(1, nodes[0]);
				expect(destroyComponentsSpy).toHaveBeenNthCalledWith(2, nodes[3]);
			});
		});
	});

	describe('method:destroy', () => {
		it('should destroy components from root', () => {
			const destroyComponentsSpy = vi.spyOn(ComponentsManager.prototype, 'destroyComponents');

			manager.destroy();

			expect(destroyComponentsSpy).toBeCalledTimes(1);
			expect(destroyComponentsSpy).toHaveBeenNthCalledWith(1, app.rootElement);
		});

		it('should make sure no components would be mounted after destroy', () => {
			vi.useFakeTimers();

			app.rootElement.innerHTML = `<div data-c1></div>`;
			const manager = new ComponentsManager(app);
			const storedComponent = getStoredComponentByName('c1');
			const componentFactory = storedComponent.factory;

			manager.run();
			manager.destroy();
			vi.runAllTimers();
			expect(componentFactory).toBeCalledTimes(1);

			const componentInstance = getComponentInstance(componentFactory, 0);

			expect(componentInstance.mount).not.toBeCalled();

			vi.useRealTimers();
		});
	});

	describe('method:harvestComponents', () => {
		it('should call factories for every component defined in DOM and mount in the next async cycle', () => {
			vi.useFakeTimers();
			app.rootElement.innerHTML = `
				<div data-c1></div>
				<div data-c2 data-c3></div>
				<div data-c3></div>
			`;
			const manager = new ComponentsManager(app);
			const storedC1 = getStoredComponentByName('c1');
			const storedC2 = getStoredComponentByName('c2');
			const storedC3 = getStoredComponentByName('c3');

			manager.harvestComponents(app.rootElement);

			expect(storedC1.factory).toBeCalledTimes(1);
			expect(storedC2.factory).toBeCalledTimes(1);
			expect(storedC3.factory).toBeCalledTimes(2);

			const c1Instance = getComponentInstance(storedC1.factory, 0);
			const c2Instance = getComponentInstance(storedC2.factory, 0);
			const c3Instance1 = getComponentInstance(storedC3.factory, 0);
			const c3Instance2 = getComponentInstance(storedC3.factory, 1);

			expect(c1Instance.mount).not.toBeCalled();
			expect(c2Instance.mount).not.toBeCalled();
			expect(c3Instance1.mount).not.toBeCalled();
			expect(c3Instance2.mount).not.toBeCalled();

			vi.advanceTimersByTime(1);

			expect(c1Instance.mount).toHaveBeenCalledTimes(1);
			expect(c2Instance.mount).toHaveBeenCalledTimes(1);
			expect(c3Instance1.mount).toHaveBeenCalledTimes(1);
			expect(c3Instance2.mount).toHaveBeenCalledTimes(1);

			vi.useRealTimers();
		});

		it('should add ovee component class and save instances on element itself', () => {
			vi.useFakeTimers();
			app.rootElement.innerHTML = `
				<div data-c1></div>
				<div data-c2 data-c3></div>
				<div data-c3></div>
			`;
			const manager = new ComponentsManager(app);
			const storedC1 = getStoredComponentByName('c1');
			const storedC2 = getStoredComponentByName('c2');
			const storedC3 = getStoredComponentByName('c3');

			manager.harvestComponents(app.rootElement);

			const components = Array.from(
				app.rootElement.querySelectorAll<HTMLOveeElement>(`.${manager.componentCssClass}`)
			);
			const c1Instance = getComponentInstance(storedC1.factory, 0);
			const c2Instance = getComponentInstance(storedC2.factory, 0);
			const c3Instance1 = getComponentInstance(storedC3.factory, 0);
			const c3Instance2 = getComponentInstance(storedC3.factory, 1);

			expect(components.length).toBe(3);
			expect(components[0]._OveeComponentInstances?.length).toBe(1);
			expect(components[0]._OveeComponentInstances?.[0]).toBe(c1Instance);

			expect(components[1]._OveeComponentInstances?.length).toBe(2);
			expect(components[1]._OveeComponentInstances?.[0]).toBe(c2Instance);
			expect(components[1]._OveeComponentInstances?.[1]).toBe(c3Instance1);

			expect(components[2]._OveeComponentInstances?.length).toBe(1);
			expect(components[2]._OveeComponentInstances?.[0]).toBe(c3Instance2);

			vi.useRealTimers();
		});
	});

	describe('method:destroyComponents', () => {
		it('should run unmount on all initialized components', () => {
			vi.useFakeTimers();
			app.rootElement.innerHTML = `
				<div data-c1></div>
				<div data-c2 data-c3></div>
				<div data-c3></div>
			`;
			const manager = new ComponentsManager(app);
			const storedC1 = getStoredComponentByName('c1');
			const storedC2 = getStoredComponentByName('c2');
			const storedC3 = getStoredComponentByName('c3');

			manager.harvestComponents(app.rootElement);
			vi.runAllTimers();

			const c1Instance = getComponentInstance(storedC1.factory, 0);
			const c2Instance = getComponentInstance(storedC2.factory, 0);
			const c3Instance1 = getComponentInstance(storedC3.factory, 0);
			const c3Instance2 = getComponentInstance(storedC3.factory, 1);

			expect(c1Instance.unmount).not.toBeCalled();
			expect(c2Instance.unmount).not.toBeCalled();
			expect(c3Instance1.unmount).not.toBeCalled();
			expect(c3Instance2.unmount).not.toBeCalled();

			manager.destroyComponents(app.rootElement);

			expect(c1Instance.unmount).toHaveBeenCalledTimes(1);
			expect(c2Instance.unmount).toHaveBeenCalledTimes(1);
			expect(c3Instance1.unmount).toHaveBeenCalledTimes(1);
			expect(c3Instance2.unmount).toHaveBeenCalledTimes(1);

			vi.useRealTimers();
		});

		it('should remove ovee component class and saved instances on element itself', () => {
			vi.useFakeTimers();
			const testClass = 'test';
			app.rootElement.innerHTML = `
				<div class="${testClass}" data-c1></div>
				<div class="${testClass}" data-c2 data-c3></div>
				<div class="${testClass}" data-c3></div>
			`;
			const manager = new ComponentsManager(app);

			manager.harvestComponents(app.rootElement);
			vi.runAllTimers();
			manager.destroyComponents(app.rootElement);

			const components = Array.from(
				app.rootElement.querySelectorAll<HTMLOveeElement>(`.${testClass}`)
			);
			const componentsByComponentClass = Array.from(
				app.rootElement.querySelectorAll(`.${manager.componentCssClass}`)
			);

			expect(componentsByComponentClass.length).toBe(0);
			expect(components.length).toBe(3);
			expect(components[0]._OveeComponentInstances).not.toBeDefined();
			expect(components[1]._OveeComponentInstances).not.toBeDefined();
			expect(components[2]._OveeComponentInstances).not.toBeDefined();

			vi.useRealTimers();
		});
	});

	describe('getter:componentCssClass', () => {
		it('should return custom ovee components class, using config namespace', () => {
			const namespace1 = 'name1';
			const namespace2 = 'name2';

			appConfig.updateConfig({ namespace: namespace1 });

			expect(manager.componentCssClass).toBe(`${namespace1}-component`);

			appConfig.updateConfig({ namespace: namespace2 });

			expect(manager.componentCssClass).toBe(`${namespace2}-component`);
		});
	});

	describe('method:addComponentsToMount', () => {
		it('should mount received components instances on next async cycle', () => {
			vi.useFakeTimers();
			const c1 = { mount: vi.fn() } as any as ComponentInternalInstance;
			const c2 = { mount: vi.fn() } as any as ComponentInternalInstance;

			manager.addComponentsToMount(c1, c2);
			vi.advanceTimersByTime(1);

			expect(c1.mount).toHaveBeenCalledTimes(1);
			expect(c2.mount).toHaveBeenCalledTimes(1);

			vi.useRealTimers();
		});
	});
});

function getStoredComponentByName(name: string): MaybeMockedDeep<StoredComponent> {
	const _setupComponent = vi.mocked(setupComponent);
	const index = _setupComponent.mock.calls.findIndex(c => c[1] === name);

	return _setupComponent.mock.results[index].value;
}

function getComponentInstance(
	factory: MaybeMocked<ComponentFactory>,
	callNumber: number
): MaybeMockedDeep<ComponentInternalInstance> {
	return factory.mock.results[callNumber].value;
}
