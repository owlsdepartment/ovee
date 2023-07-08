import { SpyInstance } from '@vitest/spy';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	App,
	AppConfigurator,
	ComponentsManager,
	createApp,
	defineComponent,
	HTMLOveeElement,
} from '@/core';
// import * as coreComponent from '@/core/component';
import { ComponentInternalInstance } from '@/core/component';
import * as setupComponentModule from '@/core/component/setupComponent';
import { StoredComponent } from '@/core/component/setupComponent';
import { attachMutationObserver } from '@/utils';

vi.mock('@/core/app/App', () => {
	return {
		App: class {
			constructor(public configurator: AppConfigurator, public rootElement: HTMLElement) {}
		},
	};
});

vi.mock('@/utils/attachMutationObserver');
vi.mock('@/core/component/ComponentInternalInstance', async () => {
	const { ComponentInternalInstance } = await vi.importActual<
		typeof import('@/core/component/ComponentInternalInstance')
	>('@/core/component/ComponentInternalInstance');

	const mock = vi.fn((...args) => {
		const i: ComponentInternalInstance = new (ComponentInternalInstance as any)(...args);

		i.mount = vi.fn(ComponentInternalInstance.prototype.mount);
		i.unmount = vi.fn(ComponentInternalInstance.prototype.unmount);

		return i;
	});

	return {
		ComponentInternalInstance: mock,
	};
});

const setupComponentSpy = vi.spyOn(setupComponentModule, 'setupComponent');

describe('ComponentsManager', () => {
	let appConfig: AppConfigurator;
	let app: App;
	let manager: ComponentsManager;
	const _createApp = () => new App(appConfig, document.body);
	const _attachMutationObserver = vi.mocked(attachMutationObserver);
	const c1 = defineComponent(() => {});
	const c2 = defineComponent<HTMLElement, { a: string }>(() => {});
	const c3 = defineComponent<HTMLElement, { a: string }>(() => ({ b: true }));
	const PascalCase = defineComponent(() => {});
	const c3Options = { a: '' };

	beforeEach(() => {
		appConfig = createApp();
		appConfig.component('c-1', c1);
		appConfig.components({ 'c-2': c2, 'c-3': [c3, c3Options] });
		appConfig.component('PascalCase', PascalCase);
		app = _createApp();
		document.body.innerHTML = '';
		manager = new ComponentsManager(app);
		setupComponentSpy.mockClear();
		_attachMutationObserver.mockClear();

		return () => {
			manager.destroy();
		};
	});

	describe('constructor', () => {
		it('should setup components', () => {
			const manager = new ComponentsManager(app);

			expect(manager.storedComponents.size).toBe(4);
			expect(setupComponentSpy).toHaveBeenCalledTimes(4);

			expect(setupComponentSpy).toHaveBeenNthCalledWith(1, app, 'c-1', c1, undefined);
			expect(setupComponentSpy).toHaveBeenNthCalledWith(2, app, 'c-2', c2, undefined);
			expect(setupComponentSpy).toHaveBeenNthCalledWith(3, app, 'c-3', c3, c3Options);
			expect(setupComponentSpy).toHaveBeenNthCalledWith(
				4,
				app,
				'pascal-case',
				PascalCase,
				undefined
			);
		});
	});

	describe('method:run', () => {
		const harvestComponentsSpy = vi.spyOn(ComponentsManager.prototype, 'harvestComponents');

		beforeEach(() => {
			harvestComponentsSpy.mockClear();
		});

		it('should register Ovee components as custom elements', () => {
			expect(customElements.get('c-1')).toBeUndefined();

			manager.run();

			expect(customElements.get('c-1')).toBeTypeOf('function');
			expect(customElements.get('c-1')?.prototype).toBeInstanceOf(HTMLElement);
			expect(customElements.get('c-2')).toBeTypeOf('function');
			expect(customElements.get('c-2')?.prototype).toBeInstanceOf(HTMLElement);
			expect(customElements.get('c-3')).toBeTypeOf('function');
			expect(customElements.get('c-3')?.prototype).toBeInstanceOf(HTMLElement);
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

			app.rootElement.innerHTML = `<div data-c-1></div>`;
			const manager = new ComponentsManager(app);
			const { factorySpy } = getStoredComponentByName('c-1');

			manager.run();
			manager.destroy();
			vi.runAllTimers();
			expect(factorySpy).toBeCalledTimes(1);

			const componentInstance = getComponentInstance(factorySpy, 0);

			expect(componentInstance.mount).not.toBeCalled();

			vi.useRealTimers();
		});
	});

	describe('method:harvestComponents', () => {
		it('should call factories for every component defined in DOM and mount in the next async cycle', () => {
			vi.useFakeTimers();
			app.rootElement.innerHTML = `
				<div id="1" data-c-1></div>
				<div id="2" data-c-2 data-c-3></div>
				<div id="3" data-c-3></div>
				<div id="4" data-pascal-case></div>
			`;
			const manager = new ComponentsManager(app);
			const { factorySpy: c1FactorySpy } = getStoredComponentByName('c-1');
			const { factorySpy: c2FactorySpy } = getStoredComponentByName('c-2');
			const { factorySpy: c3FactorySpy } = getStoredComponentByName('c-3');
			const { factorySpy: pascalCaseFactorySpy } = getStoredComponentByName('pascal-case');
			const element1 = document.getElementById('1');
			const element2 = document.getElementById('2');
			const element3 = document.getElementById('3');
			const element4 = document.getElementById('4');

			manager.harvestComponents(app.rootElement);

			expect(c1FactorySpy).toBeCalledTimes(1);
			expect(c1FactorySpy).toHaveBeenNthCalledWith(1, element1);
			expect(c2FactorySpy).toBeCalledTimes(1);
			expect(c2FactorySpy).toHaveBeenNthCalledWith(1, element2);
			expect(c3FactorySpy).toBeCalledTimes(2);
			expect(c3FactorySpy).toHaveBeenNthCalledWith(1, element2);
			expect(c3FactorySpy).toHaveBeenNthCalledWith(2, element3);
			expect(pascalCaseFactorySpy).toHaveBeenNthCalledWith(1, element4);

			const c1Instance = getComponentInstance(c1FactorySpy, 0);
			const c2Instance = getComponentInstance(c2FactorySpy, 0);
			const c3Instance1 = getComponentInstance(c3FactorySpy, 0);
			const c3Instance2 = getComponentInstance(c3FactorySpy, 1);
			const pascalCaseInstance = getComponentInstance(pascalCaseFactorySpy, 0);

			expect(c1Instance.mount).not.toBeCalled();
			expect(c2Instance.mount).not.toBeCalled();
			expect(c3Instance1.mount).not.toBeCalled();
			expect(c3Instance2.mount).not.toBeCalled();
			expect(pascalCaseInstance.mount).not.toBeCalled();

			vi.advanceTimersByTime(1);

			expect(c1Instance.mount).toHaveBeenCalledTimes(1);
			expect(c2Instance.mount).toHaveBeenCalledTimes(1);
			expect(c3Instance1.mount).toHaveBeenCalledTimes(1);
			expect(c3Instance2.mount).toHaveBeenCalledTimes(1);
			expect(pascalCaseInstance.mount).toHaveBeenCalledTimes(1);

			vi.useRealTimers();
		});

		it('should add ovee component class', () => {
			vi.useFakeTimers();
			app.rootElement.innerHTML = `
				<div data-c-1></div>
				<div data-c-2 data-c-3></div>
				<div data-c-3></div>
			`;
			const manager = new ComponentsManager(app);

			manager.harvestComponents(app.rootElement);

			const components = Array.from(
				app.rootElement.querySelectorAll<HTMLOveeElement>(`.${manager.componentCssClass}`)
			);

			expect(components.length).toBe(3);

			vi.useRealTimers();
		});
	});

	describe('method:destroyComponents', () => {
		it('should run unmount on all initialized components', () => {
			vi.useFakeTimers();
			app.rootElement.innerHTML = `
				<div data-c-1></div>
				<div data-c-2 data-c-3></div>
				<div data-c-3></div>
			`;
			const manager = new ComponentsManager(app);
			const { factorySpy: c1FactorySpy } = getStoredComponentByName('c-1');
			const { factorySpy: c2FactorySpy } = getStoredComponentByName('c-2');
			const { factorySpy: c3FactorySpy } = getStoredComponentByName('c-3');

			manager.harvestComponents(app.rootElement);
			vi.runAllTimers();

			const c1Instance = getComponentInstance(c1FactorySpy, 0);
			const c2Instance = getComponentInstance(c2FactorySpy, 0);
			const c3Instance1 = getComponentInstance(c3FactorySpy, 0);
			const c3Instance2 = getComponentInstance(c3FactorySpy, 1);

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
				<div class="${testClass}" data-c-1></div>
				<div class="${testClass}" data-c-2 data-c-3></div>
				<div class="${testClass}" data-c-3></div>
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

function getStoredComponentByName(name: string) {
	const index = setupComponentSpy.mock.calls.findIndex(c => c[1] === name);
	const stored = setupComponentSpy.mock.results[index].value as StoredComponent;
	const factorySpy = vi.spyOn(stored, 'factory');

	return { stored, factorySpy };
}

function getComponentInstance(
	factory: SpyInstance<[HTMLElement], ComponentInternalInstance>,
	callNumber: number
): ComponentInternalInstance {
	return factory.mock.results[callNumber].value;
}
