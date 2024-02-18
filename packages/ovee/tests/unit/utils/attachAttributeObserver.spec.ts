import { describe, expect, it, vi } from 'vitest';

import { attachAttributeObserver } from '@/utils';
import { useDOMCleanup } from '#/helpers';

describe('attachAttributeObserver', () => {
	useDOMCleanup();

	it(`returns 'MutationObserver' instance`, () => {
		const { observer } = attachAttributeObserver('tmp', () => {});

		expect(observer).toBeInstanceOf(MutationObserver);
	});

	it('returns method to attach observer to a specific element', () => {
		const cb = vi.fn();
		const { observe } = attachAttributeObserver('test', cb);
		const element = document.createElement('div');
		document.body.append(element);

		observe(element);
		element.setAttribute('test', '');
		element.setAttribute('other', '');

		expect(cb).toBeCalledTimes(1);
		expect(cb.mock.calls[0][0]).toBeTypeOf('object');
	});

	it('returns method to fully disconnect observer', () => {
		const cb = vi.fn();
		const { observe, disconnect } = attachAttributeObserver('test', cb);
		const element = document.createElement('div');
		document.body.append(element);

		observe(element);
		element.setAttribute('test', '');

		expect(cb).toBeCalledTimes(1);

		disconnect();
		element.removeAttribute('test');

		expect(cb).toBeCalledTimes(1);
	});
});
