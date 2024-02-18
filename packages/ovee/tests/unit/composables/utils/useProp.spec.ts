import { describe, expect, it } from 'vitest';

import { onMounted, useProp } from '@/composables';
import { defineComponent } from '@/core';
import { OveeRef } from '@/utils';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('useProp');

describe('useProp', () => {
	const warnSpy = spyConsole('warn');

	it('warns user, when used outside of a component', () => {
		useProp('');

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});

	it('returns elements property value', () => {
		let title: OveeRef<string>;
		const propName = 'title';
		const c = defineComponent(() => {
			title = useProp(propName);
		});
		const i = createComponent(c);

		expect(title!.value).toBe('');

		i.element[propName] = 'test';

		expect(title!.value).toBe('test');
	});

	it('tries to set property value, if it is possible', () => {
		const propName = 'title';
		const propValue = 'test text';
		const c = defineComponent(() => {
			const title = useProp(propName);

			onMounted(() => {
				title.value = propValue;
			});
		});
		const i = createComponent(c, {}, false);

		expect(i.element.title).toBe('');

		i.mount();

		expect(i.element.title).toBe(propValue);
	});
});
