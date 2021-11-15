import { AppEvent } from 'src/dom/AppEvent';

describe('AppEvent class', () => {
	it('should be instance of CustomEvent', () => {
		const event = new AppEvent('foo', { detail: 'bar' });

		expect(event).toBeInstanceOf(CustomEvent);
	});
});
