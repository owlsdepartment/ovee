import { describe, expect, it } from 'vitest';

import { defineModule } from '@/core';
import { isModuleDefinition } from '@/utils';

describe('isModuleDefinition', () => {
	it('detects if passed argument is a module definition', () => {
		const module = defineModule(() => {});

		expect(isModuleDefinition({})).toBe(false);
		expect(isModuleDefinition(2)).toBe(false);
		expect(isModuleDefinition('2')).toBe(false);
		expect(isModuleDefinition(null)).toBe(false);
		expect(isModuleDefinition(undefined)).toBe(false);
		expect(isModuleDefinition(() => {})).toBe(false);

		expect(isModuleDefinition(module)).toBe(true);
	});
});
