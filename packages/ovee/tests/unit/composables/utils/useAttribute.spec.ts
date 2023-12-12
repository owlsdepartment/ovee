import { watchEffect } from '@vue/runtime-core';
import { describe, expect, it, vi } from 'vitest';

import { onMounted, useAttribute } from '@/composables';
import { defineComponent } from '@/core';
import { OveeRef } from '@/utils';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('useAttribute');

describe('useAttribute', () => {
	const warnSpy = spyConsole('warn');

	it('warns user, when used outside of a component', () => {
		useAttribute('');

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});

	it('returns attribute value', () => {
		let attr: OveeRef<string | null>;
		const attrName = 'disabled';
		const attrValue = '';
		const c = defineComponent(() => {
			attr = useAttribute(attrName);
		});
		const instance = createComponent(c);

		expect(attr!.value).toBe(null);

		instance.element.setAttribute(attrName, attrValue);

		expect(attr!.value).toBe(attrValue);
	});

	it('updates attribute value', () => {
		const attrName = 'disabled';
		const attrValue = '';
		const c = defineComponent(() => {
			const attr = useAttribute(attrName);

			onMounted(() => {
				attr.value = attrValue;
			});
		});
		const instance = createComponent(c, {}, false);

		expect(instance.element.getAttribute(attrName)).toBe(null);

		instance.mount();

		expect(instance.element.getAttribute(attrName)).toBe(attrValue);
	});

	it('maps attribute values with prebuilt mappers', () => {
		let a1: OveeRef<number>;
		let a2: OveeRef<boolean>;
		const a1Name = 'amount';
		const a2Name = 'enabled';
		const c = defineComponent(() => {
			a1 = useAttribute(a1Name, 'number');
			a2 = useAttribute(a2Name, 'boolean');

			onMounted(() => {
				a1.value = 2;
				a2.value = false;
			});
		});
		const i = createComponent(c, {}, false);

		expect(a1!.value).toBeNaN();
		expect(a2!.value).toBe(false);

		i.element.setAttribute(a1Name, '1');
		i.element.setAttribute(a2Name, '');

		expect(a1!.value).toBe(1);
		expect(a2!.value).toBe(true);

		i.mount();

		expect(a1!.value).toBe(2);
		expect(a2!.value).toBe(false);
	});

	it('maps attribute values with custom mappers', () => {
		let a1: OveeRef<number>;
		let a2: OveeRef<string>;
		const a1Name = 'index';
		const a2Name = 'upper';
		const c = defineComponent(() => {
			a1 = useAttribute<number>(a1Name, {
				get: v => {
					const parsed = v ? parseInt(v) : NaN;

					return isNaN(parsed) ? 0 : parsed + 1;
				},
				set: v => {
					return isNaN(v) ? undefined : `${v - 1}`;
				},
			});
			a2 = useAttribute<string>(a2Name, {
				get: v => v?.toUpperCase() ?? '',
				set: v => v,
			});
			onMounted(() => {
				a1.value = 5;
				a2.value = 'test';
			});
		});

		const i = createComponent(c, {}, false);

		expect(a1!.value).toBe(0);
		expect(a2!.value).toBe('');

		i.element.setAttribute(a1Name, '1');
		i.element.setAttribute(a2Name, 'test');

		expect(a1!.value).toBe(2);
		expect(a2!.value).toBe('TEST');

		i.mount();

		expect(i.element.getAttribute(a1Name)).toBe('4');
		expect(i.element.getAttribute(a2Name)).toBe('test');
	});

	it('is reactive', () => {
		const attrName = 'attr';
		const value = 'test';
		const watchFn = vi.fn();
		const c = defineComponent(() => {
			const attr = useAttribute(attrName);

			watchEffect(
				() => {
					watchFn(attr.value);
				},
				{ flush: 'sync' }
			);
		});
		const i = createComponent(c);

		expect(watchFn).toBeCalledTimes(1);
		expect(watchFn).toHaveBeenNthCalledWith(1, null);

		i.element.setAttribute(attrName, value);

		expect(watchFn).toHaveBeenNthCalledWith(2, value);
	});

	it('stops change detection on component unmount', () => {
		const attrName = 'attr';
		const value = 'test';
		const watchFn = vi.fn();
		const c = defineComponent(() => {
			const attr = useAttribute(attrName);

			watchEffect(
				() => {
					watchFn(attr.value);
				},
				{ flush: 'sync' }
			);
		});

		const i = createComponent(c);

		i.element.setAttribute(attrName, value);
		expect(watchFn).toHaveBeenNthCalledWith(2, value);

		i.unmount();

		i.element.removeAttribute(attrName);
		expect(watchFn).toBeCalledTimes(2);
	});
});
