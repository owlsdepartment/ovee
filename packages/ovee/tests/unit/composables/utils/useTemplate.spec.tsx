import { computed, nextTick, ref } from '@vue/runtime-core';
import { beforeEach, describe, expect, it } from 'vitest';

import { useTemplate } from '@/composables';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

// vi.mock('@/jsx', async () => {
// 	const original = await vi.importActual<typeof import('@/jsx')>('@/jsx');

// 	return {
// 		...original,
// 		createRenderer: vi.fn(original.createRenderer),
// 	};
// });

const loggerRegExp = createLoggerRegExp('useTemplate');

describe('useTemplate', () => {
	const warnSpy = spyConsole('warn');
	// const _createRenderer = vi.mocked(createRenderer);

	beforeEach(() => {
		// _createRenderer.mockClear();
	});

	it('warns user, when used outside of a component', () => {
		useTemplate(() => undefined);

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});

	it('renders simple HTML from JSX', async () => {
		const c = defineComponent(() => {
			useTemplate(() => <h1>hi</h1>);
		});

		const instance = createComponent(c);

		await nextTick();

		expect(instance.element.innerHTML).toBe('<h1>hi</h1>');
	});

	it(`returns 'requestUpdate' function, that can update template by force`, async () => {
		let ru: () => Promise<any>;
		let innerText = '';

		const c = defineComponent(() => {
			ru = useTemplate(() => <p>{innerText}</p>).requestUpdate;
		});
		const instance = createComponent(c, {}, false);

		await nextTick();

		expect(instance.element.innerHTML).toBe('<p></p>');

		innerText = 'test';
		await ru!();

		expect(instance.element.innerHTML).toBe(`<p>${innerText}</p>`);
	});

	it('updates template when reactive data used inside changed', async () => {
		const r1 = ref('test1');
		const r2 = ref(0);
		const comp = computed(() => r2.value + 1);
		const c = defineComponent(() => {
			useTemplate(() => (
				<p>
					{r1.value} {comp.value}
				</p>
			));
		});
		const instance = createComponent(c);

		await nextTick();

		expect(instance.element.innerHTML).toBe('<p>test1 1</p>');

		r1.value = 'test2';
		await nextTick();

		expect(instance.element.innerHTML).toBe('<p>test2 1</p>');

		r2.value = 1;
		await nextTick();

		expect(instance.element.innerHTML).toBe('<p>test2 2</p>');
	});

	describe(`multiple 'useTemplate' in a single component`, () => {
		it('uses the newest registered template', async () => {
			const component = defineComponent(() => {
				useTemplate(() => <p>first</p>);
				useTemplate(() => <p>second</p>);
				useTemplate(() => <p>last</p>);
			});
			const instance = createComponent(component);

			await nextTick();

			expect(instance.element.innerHTML).toBe('<p>last</p>');
		});

		it('instantiate only one renderer', async () => {
			const component = defineComponent(() => {
				useTemplate(() => '');
				useTemplate(() => '');
				useTemplate(() => '');
			});
			createComponent(component);

			await nextTick();

			// expect(_createRenderer).toBeCalledTimes(1);
		});
	});

	it.todo('renders child component');
	it.todo('keeps child component instance on template rerender');
	it.todo('resolves attributes properly....');
});
