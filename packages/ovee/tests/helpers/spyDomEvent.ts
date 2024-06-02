import { afterAll, beforeEach, vi } from 'vitest';

export function spyDomEvent(event: string, target: EventTarget) {
	const callback = vi.fn();

	target.addEventListener(event, callback);

	beforeEach(() => {
		callback.mockReset();
	});

	afterAll(() => {
		target.removeEventListener(event, callback);
	});

	return callback;
}
