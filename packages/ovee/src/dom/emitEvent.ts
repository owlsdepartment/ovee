import { AppEvent } from './AppEvent';

export function emitEvent(targetElement: Element, eventDesc: Event | string, detail?: any): void {
	const event = eventDesc instanceof Event ? eventDesc : new AppEvent(eventDesc, { detail });

	targetElement.dispatchEvent(event);
}
