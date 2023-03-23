import { describe, expect, it, vi } from 'vitest';

import { EventBus } from '@/utils';

describe('EventBus', () => {
	it('should add ability to subscribe for event emit', () => {
		const bus = new EventBus();
		const cb1 = vi.fn();
		const cb2 = vi.fn();

		bus.on(cb1);
		bus.on(cb2);
		bus.emit();
		bus.emit();

		expect(cb1).toBeCalledTimes(2);
		expect(cb2).toBeCalledTimes(2);
	});

	it('should add ability to unsubscribe from bus', () => {
		const bus = new EventBus();
		const cb1 = vi.fn();
		const cb2 = vi.fn();

		bus.on(cb1);
		bus.on(cb2);
		bus.emit();

		expect(cb1).toBeCalledTimes(1);
		expect(cb2).toBeCalledTimes(1);

		bus.off(cb1);
		bus.emit();

		expect(cb1).toBeCalledTimes(1);
		expect(cb2).toBeCalledTimes(2);
	});

	it('should handle one time subscriptions', () => {
		const bus = new EventBus();
		const cb1 = vi.fn();
		const cb2 = vi.fn();

		bus.on(cb1, true);
		bus.on(cb2);
		bus.emit();

		expect(cb1).toBeCalledTimes(1);
		expect(cb2).toBeCalledTimes(1);

		bus.emit();

		expect(cb1).toBeCalledTimes(1);
		expect(cb2).toBeCalledTimes(2);
	});
});
