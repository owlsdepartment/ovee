import { JSDOM } from 'jsdom';

import { attachMutationObserver } from '../../../src/utils/attachMutationObserver';

const dom = new JSDOM('<!DOCTYPE html>');

describe('attachMutationObserver function', () => {
	const body = dom.window.document.documentElement;
	const mutationObserverMethods = {
		constuctor: jest.fn(),
		disconnect: jest.fn(),
		observe: jest.fn(),
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
		Object.values(mutationObserverMethods).forEach(fn => fn.mockReset());
	});

	it('should return instance of MutationObserver', () => {
		const observer = attachMutationObserver(body, jest.fn(), jest.fn());

		expect(observer).toBeInstanceOf(MutationObserver);
	});

	it('calls MutationObserver observe method with proper params', () => {
		attachMutationObserver(body, jest.fn(), jest.fn());

		expect(mutationObserverMethods.observe.mock.calls.length).toBe(1);
		expect(mutationObserverMethods.observe.mock.calls[0][0]).toEqual(body);
	});

	it('passes callable to MutationObserver constructor', () => {
		window.MutationObserver = MutationObserver as typeof window.MutationObserver;
		attachMutationObserver(body, jest.fn(), jest.fn());

		const listener = mutationObserverMethods.constuctor.mock.calls[0][0];

		expect(listener).toBeInstanceOf(Function);
	});

	it('passes filtered list of nodes to proper callback methods', () => {
		const addedCallback = jest.fn();
		const removedCallback = jest.fn();
		const mutations = [
			{
				type: 'characterData',
				target: dom.window.document.createElement('div'),
			},
			{
				type: 'childList',
				target: dom.window.document.createElement('div'),
				addedNodes: [dom.window.document.createElement('div')],
				removedNodes: [dom.window.document.createElement('div')],
			},
			{
				type: 'childList',
				target: dom.window.document.createElement('div'),
				addedNodes: [dom.window.document.createElement('div')],
				removedNodes: [],
			},
		];

		window.MutationObserver = MutationObserver as typeof window.MutationObserver;
		attachMutationObserver(body, addedCallback, removedCallback);

		const listener = mutationObserverMethods.constuctor.mock.calls[0][0];
		listener(mutations);

		expect(addedCallback.mock.calls.length).toBe(2);
		expect(removedCallback.mock.calls.length).toBe(1);
		expect(addedCallback.mock.calls[0][0]).toEqual(mutations[1].addedNodes);
		expect(addedCallback.mock.calls[1][0]).toEqual(mutations[2].addedNodes);
		expect(removedCallback.mock.calls[0][0]).toEqual(mutations[1].removedNodes);
	});
});
