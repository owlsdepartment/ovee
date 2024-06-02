import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App, AppConfigurator, createApp, defineComponent } from '@/core';
import { ComponentInternalInstance } from '@/core/Component';
import { getComponentCustomElement } from '@/core/Component/getComponentCustomElement';

describe('getComponentCustomElement', () => {
	let appConfig: AppConfigurator;
	let app: App;
	const _createApp = () => new App(appConfig, document.body);
	const name = 'test-name';
	const component = defineComponent(() => {});
	const options = {};
	const factory = vi.fn(
		(el: HTMLElement) => new ComponentInternalInstance(name, el, app, component, options)
	);

	beforeEach(() => {
		appConfig = createApp();
		app = _createApp();
		factory.mockClear();
	});

	describe('register:method', () => {
		it(`should add component to 'CustomElements' registry`, () => {
			expect(customElements.get(name)).toBeUndefined();

			const { register, ComponentElement } = getComponentCustomElement(name, factory);

			register();

			const CustomElement = customElements.get(name);

			expect(CustomElement).toBeTypeOf('function');
			expect(CustomElement?.prototype).toBeInstanceOf(HTMLElement);
			expect(CustomElement).toBe(ComponentElement);
		});

		it(`should not duplicate calls to 'define', event when called multiple times`, () => {
			const defineSpy = vi.spyOn(CustomElementRegistry.prototype, 'define');
			const { register } = getComponentCustomElement(name, factory);

			register();
			register();

			expect(defineSpy).toBeCalledTimes(1);
		});
	});

	describe('ComponentElement:class', () => {
		const mountSpy = vi.spyOn(ComponentInternalInstance.prototype, 'mount');
		const unmountSpy = vi.spyOn(ComponentInternalInstance.prototype, 'unmount');

		beforeEach(() => {
			mountSpy.mockClear();
			unmountSpy.mockClear();
		});

		it(`extends 'HTMLElement' class`, () => {
			const { ComponentElement } = getComponentCustomElement(name, factory);

			expect(ComponentElement.prototype).toBeInstanceOf(HTMLElement);
		});

		it('runs factory and saves instance to internal field', () => {
			const { ComponentElement } = getComponentCustomElement(name, factory);
			const element = new ComponentElement();

			expect(factory).toBeCalledTimes(1);
			expect(factory).toHaveBeenNthCalledWith(1, element);
			expect(element._OveeInternalInstance).toBeInstanceOf(ComponentInternalInstance);
		});

		it('creates array of internal instances and saves instance as a first entry', () => {
			const { ComponentElement } = getComponentCustomElement(name, factory);
			const element = new ComponentElement();

			expect(element._OveeComponentInstances).toStrictEqual([element._OveeInternalInstance]);
		});

		it('runs mount and unmount, when inserted into DOM or removed from DOM', () => {
			const name = 'test-name-1';
			const { register } = getComponentCustomElement(name, factory);

			register();

			const element = document.createElement(name);

			document.body.append(element);
			element.remove();

			expect(mountSpy).toBeCalledTimes(1);
			expect(unmountSpy).toBeCalledTimes(1);
		});
	});
});
