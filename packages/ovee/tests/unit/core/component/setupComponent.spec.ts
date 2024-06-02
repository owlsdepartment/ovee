import { describe, expect, it, vi } from 'vitest';

import { AppConfigurator, defineComponent } from '@/core';
import { ComponentInternalInstance, setupComponent } from '@/core/component';
import { createTestApp } from '#/helpers';

vi.mock('@/core/app/App', () => {
	return {
		App: class {
			constructor(public configurator: AppConfigurator, public rootElement: HTMLElement) {}
		},
	};
});
vi.mock('@/core/component/ComponentInternalInstance');

describe('setupComponent', () => {
	const _app = createTestApp(undefined, false);
	const name = 'test-name';
	const component = defineComponent(() => {});
	const options = {};

	it('returns proper object', () => {
		const stored1 = setupComponent(_app.app, name, component, options);

		expect(stored1.name).toBe(name);
		expect(stored1.component).toBe(component);
		expect(stored1.options).toBe(options);
		expect(stored1.factory).toBeTypeOf('function');
		expect(stored1.register).toBeTypeOf('function');

		const stored2 = setupComponent(_app.app, name, component);

		expect(stored2.name).toBe(name);
		expect(stored2.component).toBe(component);
		expect(stored2.options).toEqual({});
		expect(stored2.factory).toBeTypeOf('function');
		expect(stored2.register).toBeTypeOf('function');
	});

	describe('factory:method', () => {
		it(`should create 'ComponentInternalInstance' instance`, () => {
			const { factory } = setupComponent(_app.app, name, component, options);
			const el = document.createElement('div');

			const instance = factory(el);

			expect(instance).toBeInstanceOf(ComponentInternalInstance);
			expect(ComponentInternalInstance).toHaveBeenNthCalledWith(
				1,
				name,
				el,
				_app.app,
				component,
				options
			);
		});
	});

	describe('register:method', () => {
		it(`should add component to 'CustomElements' registry`, () => {
			expect(customElements.get(name)).toBeUndefined();

			const { register } = setupComponent(_app.app, name, component);

			register();

			const element = customElements.get(name);

			expect(element).toBeTypeOf('function');
			expect(element?.prototype).toBeInstanceOf(HTMLElement);
		});

		it(`should not duplicate calls to 'define', event when called multiple times`, () => {
			const defineSpy = vi.spyOn(CustomElementRegistry.prototype, 'define');
			const { register } = setupComponent(_app.app, name, component);

			register();
			register();

			expect(defineSpy).toBeCalledTimes(1);
		});
	});
});
