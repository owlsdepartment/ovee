import { assertType, describe, expect, it } from 'vitest';

import { defineModule, GetModuleInstance, GetModuleOptions } from '@/core';

describe('defineModule', () => {
	it('should mark received function as a module definition function', () => {
		const module = defineModule(() => {});

		expect(module.__ovee_module_definition).toBe(true);
	});

	it('should return the same function that was passed', () => {
		const base = () => {};
		const module = defineModule(base);

		expect(module).toBe(base);
	});

	it('should make it possible to extract back options and instance type', () => {
		const m1 = defineModule(() => {});
		const m2 = defineModule<{ a: string }>(() => {});
		const m3 = defineModule(() => ({ b: 2 }));
		const m4 = defineModule<{ test: string }>(() => ({ test: 2 }));

		assertType<GetModuleOptions<typeof m1>>({});
		assertType<GetModuleInstance<typeof m1>>({});

		assertType<GetModuleOptions<typeof m2>>({ a: '' });
		assertType<GetModuleInstance<typeof m2>>({});

		assertType<GetModuleOptions<typeof m3>>({});
		assertType<GetModuleInstance<typeof m3>>({ b: 1 });

		assertType<GetModuleOptions<typeof m4>>({ test: '' });
		assertType<GetModuleInstance<typeof m4>>({ b: 1 });
	});
});
