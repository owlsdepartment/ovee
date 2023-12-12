import { describe, expect, it, vi } from 'vitest';

import { ElementRef, useElementRef, useElementRefs } from '@/composables';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

describe('useElementRef', () => {
	const warnSpy = spyConsole('warn');

	describe('single', () => {
		const loggerRegExp = createLoggerRegExp('useElementRef');

		it('warns user, when used outside of a component', () => {
			useElementRef('');

			expect(warnSpy).toBeCalledTimes(1);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
		});

		it('returns null if no matching elements were found', () => {
			const element = document.createElement('div');
			element.innerHTML = `
				<p ref=other""></p>
				<span ref="andAnother"></span>
			`;
			let elRef: ElementRef;
			const component = defineComponent(() => {
				elRef = useElementRef('ref-name');
			});

			createComponent(component, { element });

			expect(elRef!.value).toBeNull();
		});

		it('returns proper element via passed ref name', () => {
			const refName = 'test';
			document.body.innerHTML = `
				<div id="test-1">
					<p ref="${refName}"></p>
					<p ref="other"></p>
				</div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			const paragraph = document.querySelector<HTMLElement>(`[ref="${refName}"]`);
			let elRef: ElementRef;
			const component = defineComponent(() => {
				elRef = useElementRef(refName);
			});

			createComponent(component, { element });

			expect(elRef!.value).toBe(paragraph);
		});

		it('updates value properly based on dom change', () => {
			const refName = 'to-find';
			document.body.innerHTML = `
				<div id="test-1">
					<p ref="other"></p>
				</div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			let elRef: ElementRef<HTMLElement | null>;
			const component = defineComponent(() => {
				elRef = useElementRef(refName);
			});

			createComponent(component, { element });

			expect(elRef!.value).toBeNull();

			const paragraph = document.createElement('p');
			paragraph.setAttribute('ref', refName);
			element.appendChild(paragraph);

			expect(elRef!.value).toBe(paragraph);
		});

		it('disconnects observer, when component is unmounted', () => {
			const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
			const component = defineComponent(() => {
				useElementRef('selector');
			});
			const instance = createComponent(component);

			instance.unmount();

			expect(disconnectSpy).toBeCalledTimes(1);
		});

		it('reconnects observer, when component is mounted', () => {
			const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
			const component = defineComponent(() => {
				useElementRef('selector');
			});
			const instance = createComponent(component);

			instance.unmount();
			instance.mount();

			expect(observeSpy).toBeCalledTimes(2);
		});
	});

	describe('multiple', () => {
		const loggerRegExp = createLoggerRegExp('useElementRefs');

		it('warns user, when used outside of a component', () => {
			useElementRefs('');

			expect(warnSpy).toBeCalledTimes(1);
			expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
		});

		it('returns empty array if no matching elements were found', () => {
			const element = document.createElement('div');
			element.innerHTML = `
				<p ref="__"></p>
				<span ref="test"></span>
			`;
			let elRef: ElementRef<HTMLElement[]>;
			const component = defineComponent(() => {
				elRef = useElementRefs('not-existing');
			});

			createComponent(component, { element });

			expect(elRef!.value).toEqual([]);
		});

		it('returns an array of found elements', () => {
			const refName = 'item';
			document.body.innerHTML = `
				<div id="test-1">
					<div></div>
					<p ref="${refName}"></p>
					<p ref="${refName}"></p>
					<p ref="${refName}"></p>
				</div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			const paragraphs = Array.from(document.querySelectorAll('p'));
			let elRef: ElementRef<HTMLElement[]>;
			const component = defineComponent(() => {
				elRef = useElementRefs(refName);
			});

			createComponent(component, { element });

			expect(elRef!.value).toBeInstanceOf(Array);
			expect(elRef!.value?.length).toBe(3);

			for (const p of paragraphs) {
				expect(elRef!.value?.includes(p)).toBe(true);
			}
		});

		it('updates value properly based on dom change', () => {
			const refName = 'item';
			document.body.innerHTML = `
				<div id="test-1"></div>
			`;
			const element = document.querySelector<HTMLElement>('#test-1')!;
			let elRef: ElementRef<HTMLElement[]>;
			const component = defineComponent(() => {
				elRef = useElementRefs(refName);
			});

			createComponent(component, { element });

			expect(elRef!.value).toEqual([]);

			const items = Array.from({ length: 3 }).map(() => {
				const el = document.createElement('div');
				el.setAttribute('ref', refName);

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
				useElementRefs('selector');
			});
			const instance = createComponent(component);

			instance.unmount();

			expect(disconnectSpy).toBeCalledTimes(1);
		});

		it('reconnects observer, when component is mounted', () => {
			const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
			const component = defineComponent(() => {
				useElementRefs('selector');
			});
			const instance = createComponent(component);

			instance.unmount();
			instance.mount();

			expect(observeSpy).toBeCalledTimes(2);
		});
	});
});
