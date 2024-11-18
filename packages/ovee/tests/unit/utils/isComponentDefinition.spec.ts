import { describe, expect, it } from 'vitest';

import { defineComponent } from '@/core';
import { isComponentDefinition } from '@/utils';

describe('isComponentDefinition', () => {
	it('detects if passed argument is a module definition', () => {
		const component = defineComponent(() => {});

		expect(isComponentDefinition({})).toBe(false);
		expect(isComponentDefinition(2)).toBe(false);
		expect(isComponentDefinition('2')).toBe(false);
		expect(isComponentDefinition(null)).toBe(false);
		expect(isComponentDefinition(undefined)).toBe(false);
		expect(isComponentDefinition(() => {})).toBe(false);

		expect(isComponentDefinition(component)).toBe(true);
	});
});
