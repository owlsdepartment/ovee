import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { attachMutationObserver, defaultObserverConfig } from '@/utils/attachMutationObserver';

describe('attachMutationObserver function', () => {
	const body = window.document.documentElement;
	const mutationObserverMethods = {
		constuctor: vi.fn(),
		disconnect: vi.fn(),
		observe: vi.fn(),
	};
	const MutationObserver = class {
		constructor(...args: any[]) {
			return mutationObserverMethods.constuctor(...args);
		}

		disconnect(...args: any[]) {
			return mutationObserverMethods.disconnect(...args);
		}

		observe(...args: any[]) {
			return mutationObserverMethods.observe(...args);
		}
	};

	beforeAll(() => {
		window.MutationObserver = MutationObserver as typeof window.MutationObserver;
	});

	beforeEach(() => {
		Object.values(mutationObserverMethods).forEach(fn => fn.mockClear());
	});

	it('should return instance of MutationObserver', () => {
		const { observer } = attachMutationObserver(body, vi.fn(), vi.fn());

		expect(observer).toBeInstanceOf(MutationObserver);
	});

	it('calls MutationObserver observe method with proper params', () => {
		attachMutationObserver(body, vi.fn(), vi.fn());

		expect(mutationObserverMethods.observe).toBeCalledTimes(1);
		expect(mutationObserverMethods.observe).toHaveBeenNthCalledWith(1, body, defaultObserverConfig);
	});

	it('should return run function to call observe method again', () => {
		const { run } = attachMutationObserver(body, vi.fn(), vi.fn());
		const { observe } = mutationObserverMethods;

		observe.mockClear();
		run();

		expect(observe).toBeCalledTimes(1);
		expect(observe).toHaveBeenNthCalledWith(1, body, defaultObserverConfig);
	});

	it('passes callable to MutationObserver constructor', () => {
		window.MutationObserver = MutationObserver as typeof window.MutationObserver;
		attachMutationObserver(body, vi.fn(), vi.fn());

		const listener = mutationObserverMethods.constuctor.mock.calls[0][0];

		expect(listener).toBeInstanceOf(Function);
	});

	it('passes filtered list of nodes to proper callback methods', () => {
		const addedCallback = vi.fn();
		const removedCallback = vi.fn();
		const mutations = [
			{
				type: 'characterData',
				target: window.document.createElement('div'),
			},
			{
				type: 'childList',
				target: window.document.createElement('div'),
				addedNodes: [window.document.createElement('div')],
				removedNodes: [window.document.createElement('div')],
			},
			{
				type: 'childList',
				target: window.document.createElement('div'),
				addedNodes: [window.document.createElement('div')],
				removedNodes: [],
			},
		];

		window.MutationObserver = MutationObserver as typeof window.MutationObserver;
		attachMutationObserver(body, addedCallback, removedCallback);

		const listener = mutationObserverMethods.constuctor.mock.calls[0][0];
		listener(mutations);

		expect(addedCallback).toBeCalledTimes(2);
		expect(removedCallback).toBeCalledTimes(1);
		expect(addedCallback).toHaveBeenNthCalledWith(1, mutations[1].addedNodes);
		expect(addedCallback).toHaveBeenNthCalledWith(2, mutations[2].addedNodes);
		expect(removedCallback).toHaveBeenNthCalledWith(1, mutations[1].removedNodes);
	});
});
