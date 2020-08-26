import AppEvent from './AppEvent';

export default function (targetElement: Element, eventDesc: Event | string, detail?: any): void {
    const event = eventDesc instanceof Event ? eventDesc : new AppEvent(eventDesc, { detail });

    targetElement.dispatchEvent(event);
}
