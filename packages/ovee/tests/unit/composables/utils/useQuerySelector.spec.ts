import { ComputedRef } from '@vue/reactivity';
import { describe, expect, it, vi } from 'vitest';

import { useQuerySelector, useQuerySelectorAll } from '@/composables';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

describe('useQuerySelector', () => {
	const warnSpy = spyConsole('warn');

	describe('single', () => {
		const loggerRegExp = createLoggerRegExp('useQuerySelector');

		it('warns user, when used outside of a component', () => {
			useQuerySelector('');

			expect(warnSpy).toBeCalledTimes(1);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
		});

		it('returns null if no matching elements were found', () => {
			const element = document.createElement('div');
			element.innerHTML = `
				<p></p>
				<span></span>
			`;
			let elRef: ComputedRef<HTMLElement | null>;
			const component = defineComponent(() => {
				elRef = useQuerySelector('#not-existing');
			});

			createComponent(component, { element });

			expect(elRef!.value).toBeNull();
		});

		it('returns proper element via passed selector', () => {
			const className = 'to-find';
			document.body.innerHTML = `
				<div id="test-1">
					<p class="${className}"></p>
					<p class="other"></p>
				</div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			const parahraph = document.querySelector<HTMLElement>(`.${className}`);
			let elRef: ComputedRef<HTMLElement | null>;
			const component = defineComponent(() => {
				elRef = useQuerySelector(`.${className}`);
			});

			createComponent(component, { element });

			expect(elRef!.value).toBe(parahraph);
		});

		it('updates value properly based on dom change', () => {
			const className = 'to-find';
			document.body.innerHTML = `
				<div id="test-1">
					<p class="other"></p>
				</div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			let elRef: ComputedRef<HTMLElement | null>;
			const component = defineComponent(() => {
				elRef = useQuerySelector(`.${className}`);
			});

			createComponent(component, { element });

			expect(elRef!.value).toBeNull();

			const paragraph = document.createElement('p');
			paragraph.classList.add(className);
			element.appendChild(paragraph);

			expect(elRef!.value).toBe(paragraph);
		});

		it('disconnects observer, when component is unmounted', () => {
			const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
			const component = defineComponent(() => {
				useQuerySelector('.selector');
			});
			const instance = createComponent(component);

			instance.unmount();

			expect(disconnectSpy).toBeCalledTimes(1);
		});

		it('reconnects observer, when component is mounted', () => {
			const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
			const component = defineComponent(() => {
				useQuerySelector('.selector');
			});
			const instance = createComponent(component);

			instance.unmount();
			instance.mount();

			expect(observeSpy).toBeCalledTimes(2);
		});
	});

	describe('multiple', () => {
		const loggerRegExp = createLoggerRegExp('useQuerySelectorAll');

		it('warns user, when used outside of a component', () => {
			useQuerySelectorAll('');

			expect(warnSpy).toBeCalledTimes(1);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
		});

		it('returns empty array if no matching elements were found', () => {
			const element = document.createElement('div');
			element.innerHTML = `
				<p></p>
				<span></span>
			`;
			let elRef: ComputedRef<HTMLElement[]>;
			const component = defineComponent(() => {
				elRef = useQuerySelectorAll('.not-existing');
			});

			createComponent(component, { element });

			expect(elRef!.value).toEqual([]);
		});

		it('returns an array of found elements', () => {
			const itemClass = 'item';
			document.body.innerHTML = `
				<div id="test-1">
					<div></div>
					<p class="${itemClass}"></p>
					<p class="${itemClass}"></p>
					<p class="${itemClass}"></p>
				</div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			const paragraphs = Array.from(document.querySelectorAll('p'));
			let elRef: ComputedRef<HTMLElement[]>;
			const component = defineComponent(() => {
				elRef = useQuerySelectorAll(`.${itemClass}`);
			});

			createComponent(component, { element });

			expect(elRef!.value).toBeInstanceOf(Array);
			expect(elRef!.value?.length).toBe(3);

			for (const p of paragraphs) {
				expect(elRef!.value?.includes(p)).toBe(true);
			}
		});

		it('updates value properly based on dom change', () => {
			const itemClass = 'item';
			document.body.innerHTML = `
				<div id="test-1"></div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			let elRef: ComputedRef<HTMLElement[]>;
			const component = defineComponent(() => {
				elRef = useQuerySelectorAll(`.${itemClass}`);
			});

			createComponent(component, { element });

			expect(elRef!.value).toEqual([]);

			const items = Array.from({ length: 3 }).map(() => {
				const el = document.createElement('div');
				el.classList.add(itemClass);

				return el;
			});
			element.append(...items);

			expect(elRef!.value).toBeInstanceOf(Array);
			expect(elRef!.value?.length).toBe(3);

			for (const div of items) {
				expect(elRef!.value?.includes(div)).toBe(true);
			}
		});

		it('disconnects observer, when component is unmounted', () => {
			const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
			const component = defineComponent(() => {
				useQuerySelectorAll('.selector');
			});
			const instance = createComponent(component);

			instance.unmount();

			expect(disconnectSpy).toBeCalledTimes(1);
		});

		it('reconnects observer, when component is mounted', () => {
			const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
			const component = defineComponent(() => {
				useQuerySelectorAll('.selector');
			});
			const instance = createComponent(component);

			instance.unmount();
			instance.mount();

			expect(observeSpy).toBeCalledTimes(2);
		});
	});
});
