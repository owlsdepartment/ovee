import { describe, expect, it, vi } from 'vitest';

import { Task } from '@/utils';
import { flushPromises } from '#/helpers/global';

describe('Task promiselike', () => {
	it('can be later resolved', async () => {
		const thenCb = vi.fn();
		const resolveParam = {};
		const t = new Task<any>();

		t.then(thenCb);
		t.resolve(resolveParam);

		await flushPromises();

		expect(t.resolved).toBe(true);
		expect(t.rejected).toBe(false);
		expect(t.finished).toBe(true);
		expect(thenCb).toBeCalledWith(resolveParam);
	});

	it('can be later rejected', async () => {
		const catchCb = vi.fn();
		const rejectParam = {};
		const t = new Task<any>();

		t.catch(catchCb);
		t.reject(rejectParam);

		await flushPromises();

		expect(t.resolved).toBe(false);
		expect(t.rejected).toBe(true);
		expect(t.finished).toBe(true);
		expect(catchCb).toBeCalledWith(rejectParam);
	});

	it('can be awaited', async () => {
		vi.useFakeTimers();
		const resolveParam = {};
		const t = new Task<any>();

		setTimeout(() => t.resolve(resolveParam));

		vi.runAllTimers();
		const awaited = await t;

		expect(awaited).toBe(resolveParam);
		vi.useRealTimers();
	});

	it(`adds special 'Symbol.toStringTag' field`, () => {
		const t = new Task();

		expect(t.toString()).toBe('[object Task]');
	});
});
