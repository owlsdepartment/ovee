import { Logger } from 'src/errors';
import { isString, omit } from 'src/utils';

import { emitEvent } from './emitEvent';

export interface Callback<T> extends Function {
	(this: T, ...args: any[]): void;
}

export interface TargetOptions {
	target?: EventTarget | string;
	root?: true;
}

export interface ListenerOptions extends AddEventListenerOptions, TargetOptions {}

export type EventDesc = string | Event;

interface Listener {
	cleared: boolean;
	events: string;
	target: EventTarget | string;
	callback: Callback<any>;
	removeListeners: Array<() => void>;
}

const logger = new Logger('EventDelegate');

export class EventDelegate<Context = any> {
	listeners: Listener[] = [];

	constructor(public targetElement: Element, public context: Context) {}

	on(events: string, callback: Callback<Context>, options?: ListenerOptions): () => void {
		const listenerOptions = options
			? (omit(options ?? {}, ['root', 'target']) as AddEventListenerOptions)
			: undefined;
		const { baseTarget, target } = this.getTarget(options);
		const removeListeners: Array<() => void> = [];

		events.split(' ').forEach(event => {
			const handler = (...args: any[]) => callback.apply(this.context, args);

			target.addEventListener(event, handler, listenerOptions);

			removeListeners.push(() => target.removeEventListener(event, handler));
		});

		const listener: Listener = {
			cleared: false,
			events,
			callback,
			removeListeners,
			target: baseTarget,
		};

		this.listeners.push(listener);

		return () => this.clearListener(listener);
	}

	off(events: string, callback: Callback<Context>, options?: TargetOptions): void {
		const { baseTarget } = this.getTarget(options);
		const listener = this.listeners.find(
			l => l.events === events && l.callback === callback && l.target === baseTarget
		);

		if (listener) this.clearListener(listener);
	}

	private getTarget(options?: TargetOptions) {
		const baseTarget = options?.target ?? this.targetElement;
		let target: EventTarget;

		if (isString(baseTarget)) {
			const isAbsolute = options?.root;
			const newTarget = isAbsolute
				? document.querySelector(baseTarget)
				: this.targetElement.querySelector(baseTarget);

			if (!newTarget) {
				const errorMessage = `Could not find element with selector '${baseTarget}' ${
					isAbsolute ? 'in document' : 'relatively to current element'
				}`;

				throw Error(logger.getMessage(errorMessage));
			}

			target = newTarget;
		} else {
			target = baseTarget;
		}

		return { target, baseTarget };
	}

	private clearListener(listener: Listener) {
		if (listener.cleared) return;

		listener.removeListeners.forEach(cb => cb());
		listener.cleared = true;

		const idx = this.listeners.findIndex(l => l === listener);

		if (idx >= 0) this.listeners.splice(idx, 1);
	}

	emit<D = any>(eventDesc: EventDesc, detail?: D): void {
		emitEvent(this.targetElement, eventDesc, detail);
	}

	destroy(): void {
		this.listeners = this.listeners.filter(item => {
			item.removeListeners.forEach(cb => cb());

			return false;
		});
	}
}
