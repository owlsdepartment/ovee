import { assertType, describe, expect, it } from 'vitest';

import {
	defineComponent,
	GetComponentInstance,
	GetComponentOptions,
	GetComponentRoot,
} from '@/core';

describe('defineComponent', () => {
	it('should mark received function as a component definition function', () => {
		const component = defineComponent(() => {});

		expect(component.__ovee_component_definition).toBe(true);
	});

	it('should return the same function that was passed', () => {
		const base = () => {};
		const component = defineComponent(base);

		expect(component).toBe(base);
	});

	it('should make it possible to extract back options and instance type', () => {
		const c1 = defineComponent(() => {});
		const c2 = defineComponent<HTMLElement, { a: string }>(() => {});
		const c3 = defineComponent(() => ({ b: 2 }));
		const c4 = defineComponent<HTMLVideoElement, { test: string }>(() => ({ test: 2 }));

		assertType<GetComponentOptions<typeof c1>>({});
		assertType<GetComponentInstance<typeof c1>>({});
		assertType<GetComponentRoot<typeof c1>>(new HTMLElement());

		assertType<GetComponentOptions<typeof c2>>({ a: '' });
		assertType<GetComponentInstance<typeof c2>>({});
		assertType<GetComponentRoot<typeof c2>>(new HTMLElement());

		assertType<GetComponentOptions<typeof c3>>({});
		assertType<GetComponentInstance<typeof c3>>({ b: 1 });
		assertType<GetComponentRoot<typeof c3>>(new HTMLElement());

		assertType<GetComponentOptions<typeof c4>>({ test: '' });
		assertType<GetComponentInstance<typeof c4>>({ b: 1 });
		assertType<GetComponentRoot<typeof c4>>(new HTMLVideoElement());
	});
});
