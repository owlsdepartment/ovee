import { Ref, watchEffect } from '@vue/runtime-core';
import { describe, expect, it, vi } from 'vitest';

import { onMounted, useDataAttr } from '@/composables';
import { defineComponent } from '@/core';
import { createComponent, createLoggerRegExp, spyConsole } from '#/helpers';

const loggerRegExp = createLoggerRegExp('useDataAttr');

describe('useDataAttr', () => {
	const warnSpy = spyConsole('warn');

	it('warns user, when used outside of a component', () => {
		useDataAttr('');

		expect(warnSpy).toBeCalledTimes(1);
		expect(warnSpy.mock.calls[0][0]).toMatch(loggerRegExp);
	});

	it('returns data param value', () => {
		let data: Ref<string | undefined>;
		const attrName = 'disabled';
		const attrValue = '';
		const c = defineComponent(() => {
			data = useDataAttr(attrName);
		});
		const instance = createComponent(c);

		expect(data!.value).toBe(undefined);

		instance.element.dataset[attrName] = attrValue;

		expect(data!.value).toBe(attrValue);
	});

	it('updates data param value', () => {
		const attrName = 'disabled';
		const attrValue = '';
		const c = defineComponent(() => {
			const param = useDataAttr(attrName);

			onMounted(() => {
				param.value = attrValue;
			});
		});
		const instance = createComponent(c, {}, false);

		expect(instance.element.dataset[attrName]).toBe(undefined);

		instance.mount();

		expect(instance.element.dataset[attrName]).toBe(attrValue);
	});

	it('maps attribute values with prebuilt mappers', () => {
		let d1: Ref<number>;
		let d2: Ref<boolean>;
		const d1Name = 'amount';
		const d2Name = 'enabled';
		const c = defineComponent(() => {
			d1 = useDataAttr(d1Name, 'number');
			d2 = useDataAttr(d2Name, 'boolean');

			onMounted(() => {
				d1.value = 2;
				d2.value = false;
			});
		});
		const i = createComponent(c, {}, false);

		expect(d1!.value).toBeNaN();
		expect(d2!.value).toBe(false);

		i.element.dataset[d1Name] = '1';
		i.element.dataset[d2Name] = '';

		expect(d1!.value).toBe(1);
		expect(d2!.value).toBe(true);

		i.mount();

		expect(i.element.dataset[d1Name]).toBe('2');
		expect(i.element.dataset[d2Name]).toBeUndefined();
	});

	it('maps attribute values with custom mappers', () => {
		let d1: Ref<number>;
		let d2: Ref<string>;
		const d1Name = 'index';
		const d2Name = 'upper';
		const c = defineComponent(() => {
			d1 = useDataAttr<number>(d1Name, {
				get: v => {
					const parsed = v ? parseInt(v) : NaN;

					return isNaN(parsed) ? 0 : parsed + 1;
				},
				set: v => {
					return isNaN(v) ? undefined : `${v - 1}`;
				},
			});
			d2 = useDataAttr<string>(d2Name, {
				get: v => v?.toUpperCase() ?? '',
				set: v => v,
			});
			onMounted(() => {
				d1.value = 5;
				d2.value = 'test';
			});
		});

		const i = createComponent(c, {}, false);

		expect(d1!.value).toBe(0);
		expect(d2!.value).toBe('');

		i.element.dataset[d1Name] = '1';
		i.element.dataset[d2Name] = 'test';

		expect(d1!.value).toBe(2);
		expect(d2!.value).toBe('TEST');

		i.mount();

		expect(i.element.dataset[d1Name]).toBe('4');
		expect(i.element.dataset[d2Name]).toBe('test');
	});

	it('is reactive', () => {
		const attrName = 'attr';
		const value = 'test';
		const watchFn = vi.fn();
		const c = defineComponent(() => {
			const attr = useDataAttr(attrName);

			watchEffect(
				() => {
					watchFn(attr.value);
				},
				{ flush: 'sync' }
			);
		});
		const i = createComponent(c);

		expect(watchFn).toBeCalledTimes(1);
		expect(watchFn).toHaveBeenNthCalledWith(1, undefined);

		i.element.dataset[attrName] = value;

		expect(watchFn).toHaveBeenNthCalledWith(2, value);
	});

	it('stops change detection on component unmount', () => {
		const attrName = 'attr';
		const value = 'test';
		const watchFn = vi.fn();
		const c = defineComponent(() => {
			const attr = useDataAttr(attrName);

			watchEffect(
				() => {
					watchFn(attr.value);
				},
				{ flush: 'sync' }
			);
		});

		const i = createComponent(c);

		i.element.dataset[attrName] = value;
		expect(watchFn).toHaveBeenNthCalledWith(2, value);

		i.unmount();
		delete i.element.dataset[attrName];
		expect(watchFn).toBeCalledTimes(2);
	});
});
