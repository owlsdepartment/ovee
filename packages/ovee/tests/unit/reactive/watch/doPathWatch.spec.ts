import { doWatch, makeReactive } from 'src/reactive';
import { createPathGetter, doPathWatch } from 'src/reactive/watch/doPathWatch';

jest.mock('src/reactive/watch/vue', () => {
	const originalModule = jest.requireActual('src/reactive/watch/vue');

	return {
		__esModule: true,
		...originalModule,
		doWatch: jest.fn(originalModule.doWatch),
	};
});

const mockedDoWatch = doWatch as jest.Mock;

describe('doPathWatch', () => {
	describe('>>> doPathWatch helper', () => {
		beforeEach(() => {
			mockedDoWatch.mockClear();
		});

		it('should watch field changes on reactive object based on specific path', async () => {
			const old = 'a';
			const curr = 'b';
			const obj = makeReactive({
				a: old,
			});
			const cb = jest.fn();

			doPathWatch(obj, 'a', cb);
			await flushPromises();

			obj.a = curr;

			await flushPromises();

			expect(cb).toBeCalledTimes(1);
			expect(cb.mock.calls[0][0]).toBe(curr);
			expect(cb.mock.calls[0][1]).toBe(old);
		});

		it(`should watch for deep changes if '*' is used in path or if 'deep' option is set`, async () => {
			const obj = makeReactive({
				a: {
					b: 'b',
				},
				c: {},
			});
			const aCb = jest.fn();
			const rootCb = jest.fn();

			doPathWatch(obj, 'a', aCb, { deep: true });
			doPathWatch(obj, '*', rootCb);

			obj.a.b = 'test';
			obj.c = {};

			await flushPromises();

			expect(aCb).toBeCalledTimes(1);
			expect(rootCb).toBeCalledTimes(1);
		});

		it(`should run immediatly if 'immediate' option is set`, async () => {
			const obj = makeReactive({
				a: {
					b: 'b',
				},
				c: {},
			});
			const aCb = jest.fn();
			const rootCb = jest.fn();

			doPathWatch(obj, 'a', aCb, { immediate: true });
			doPathWatch(obj, '*', rootCb, { immediate: true });

			obj.a = { b: 'aaa' };
			obj.c = {};

			await flushPromises();

			expect(aCb).toBeCalledTimes(2);
			expect(rootCb).toBeCalledTimes(2);
		});
	});

	describe('>>> createPathGetter helper', () => {
		it('creates getter to an object field value base on dot seperated path', () => {
			const obj = {
				a: {
					b: {},
					c: 3,
				},
				d: 'str',
			};
			const aGetter = createPathGetter(obj, 'a');
			const bGetter = createPathGetter(obj, 'a.b');
			const cGetter = createPathGetter(obj, 'a.c');
			const dGetter = createPathGetter(obj, 'd');

			expect(aGetter()).toBe(obj.a);
			expect(bGetter()).toBe(obj.a.b);
			expect(cGetter()).toBe(obj.a.c);
			expect(dGetter()).toBe(obj.d);
		});

		it(`handles special '*' symbol to access all fields of an object`, () => {
			const obj = {
				a: {
					b: {
						c: 3,
					},
				},
			};
			const rootGetter = createPathGetter(obj, '*');
			const aGetter = createPathGetter(obj, 'a.*');

			expect(rootGetter()).toBe(obj);
			expect(aGetter()).toBe(obj.a);
		});
	});
});
