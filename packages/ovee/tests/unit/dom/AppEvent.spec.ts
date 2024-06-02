import { describe, expect, it } from 'vitest';

import { AppEvent } from '@/dom';

describe('AppEvent class', () => {
	it('should be instance of CustomEvent', () => {
		const event = new AppEvent('foo', { detail: 'bar' });

		expect(event).toBeInstanceOf(CustomEvent);
	});
});
