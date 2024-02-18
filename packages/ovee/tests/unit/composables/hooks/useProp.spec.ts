import { assertType, describe, expect, it } from 'vitest';

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

	it('returns ovee ref with current value of a property', () => {
		let innerTextRef: OveeRef<any>;
		const testText = 'hi from the inside';
		const component = defineComponent(() => {
			innerTextRef = useProp('innerText');
		});
		const instance = createComponent(component);

		expect(innerTextRef!.value).toBe('');

		instance.element.innerText = testText;

		expect(innerTextRef!.value).toBe(testText);
	});

	it('allows to change property value', () => {
		const testText = 'hi from the inside';
		const component = defineComponent(() => {
			const innerText = useProp('innerText');

			onMounted(() => (innerText.value = testText));
		});
		const instance = createComponent(component, {}, false);

		expect(instance.element.innerText).toBe('');

		instance.mount();

		expect(instance.element.innerText).toBe(testText);
	});

	it('should narrow down type if possible', () => {
		const p1 = useProp('innerText');
		const p2 = useProp('videoHeight', HTMLVideoElement);
		const p3 = useProp('videoHeight', document.createElement('video'));
		const p4 = useProp<boolean>('custom');

		assertType<(typeof p1)['value']>('');
		assertType<(typeof p2)['value']>(0);
		assertType<(typeof p3)['value']>(0);
		assertType<(typeof p4)['value']>(true);
	});
});
