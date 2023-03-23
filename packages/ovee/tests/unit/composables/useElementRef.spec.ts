import { describe, expect, it } from 'vitest';

import { ElementRef, useElementRef } from '@/composables';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('useElementRef');

describe('useElementRefs', () => {
	const warnSpy = spyConsole('warn');

	it('warns user, when used outside of a component', () => {
		useElementRef('');

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});

	it('returns null if no matching elements were found', () => {
		document.body.innerHTML = `
			<div id="test-1">
				<p ref></p>
				<p ref=""></p>
			</div>
		`;
		const element = document.querySelector<HTMLElement>('#test-1')!;
		let elRef: ElementRef;
		const component = defineComponent(() => {
			elRef = useElementRef('');
		});

		createComponent(component, { element });

		expect(elRef!.value).toBeNull();
	});

	it('returns proper element via ref name', () => {
		const refName = 'ref';
		document.body.innerHTML = `
			<div id="test-1">
				<p ref></p>
				<p id="ref-el" ref="${refName}"></p>
				<p id="ref-el-2" ref="${refName}"></p>
			</div>
		`;
		const element = document.querySelector<HTMLElement>('#test-1')!;
		const parahraph = document.querySelector<HTMLElement>('#ref-el');
		let elRef: ElementRef;
		const component = defineComponent(() => {
			elRef = useElementRef(refName);
		});

		createComponent(component, { element });

		expect(elRef!.value).toBe(parahraph);
	});

	it('returns array of elements, if flag is set to true', () => {
		const refName = 'ref';
		document.body.innerHTML = `
			<div id="test-1">
				<div ref></div>
				<p ref="${refName}"></p>
				<p ref="${refName}"></p>
				<p ref="${refName}"></p>
			</div>
		`;
		const element = document.querySelector<HTMLElement>('#test-1')!;
		const paragraphs = Array.from(document.querySelectorAll('a'));
		let elRef: ElementRef<HTMLElement[]>;
		const component = defineComponent(() => {
			elRef = useElementRef(refName, true);
		});

		createComponent(component, { element });

		expect(elRef!.value).toBeInstanceOf(Array);
		expect(elRef!.value?.length).toBe(3);

		for (const p of paragraphs) {
			expect(elRef!.value?.includes(p)).toBe(true);
		}
	});

	it('updates value properly base on dom change', () => {
		const refName = 'ref';
		document.body.innerHTML = `
			<div id="test-1">
				<p ref></p>
			</div>
		`;
		const element = document.querySelector<HTMLElement>('#test-1')!;
		let elRef: ElementRef;
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

	it.todo('disconnects observer, when component is unmounted');

	it.todo('reconnects observer, when component is mounted');

	it.todo('reuses mutation observers for the same component');
});
