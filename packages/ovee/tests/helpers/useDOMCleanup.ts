import { afterEach } from 'vitest';

export function useDOMCleanup() {
	afterEach(() => {
		document.body.innerHTML = '';
	});
}
