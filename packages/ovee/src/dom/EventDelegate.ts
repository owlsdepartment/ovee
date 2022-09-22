import { Logger } from 'src/errors';
import { isString, omit } from 'src/utils';

import { emitEvent } from './emitEvent';

export interface Callback<T> extends Function {
	(this: T, ...args: any[]): void;
}

type Target = string | EventTarget | EventTarget[];

export interface TargetOptions {
	target?: Target;
	root?: true;
	multiple?: boolean;
}

export interface ListenerOptions extends AddEventListenerOptions, TargetOptions {}

export type EventDesc = string | Event;

interface Listener {
	cleared: boolean;
	events: string;
	target: Target;
	callback: Callback<any>;
	removeListeners: Array<() => void>;
}

const logger = new Logger('EventDelegate');

export class EventDelegate<Context = any> {
	listeners: Listener[] = [];

	constructor(public targetElement: Element, public context: Context) {}

	on(events: string, callback: Callback<Context>, options?: ListenerOptions): () => void {
		const listenerOptions = options
			? (omit(options ?? {}, ['root', 'target', 'multiple']) as AddEventListenerOptions)
			: undefined;
		const { targetOption, target } = this.getTarget(options);
		const removeListeners: Array<() => void> = [];

		events.split(' ').forEach(event => {
			const handler = (...args: any[]) => callback.apply(this.context, args);
			const targets = Array.isArray(target) ? target : [target];

			targets.forEach(t => {
				t.addEventListener(event, handler, listenerOptions);
			});

			removeListeners.push(() => {
				targets.forEach(t => t.removeEventListener(event, handler));
			});
		});

		const listener: Listener = {
			cleared: false,
			events,
			callback,
			removeListeners,
			target: targetOption,
		};

		this.listeners.push(listener);

		return () => this.clearListener(listener);
	}

	off(events: string, callback: Callback<Context>, options?: TargetOptions): void {
		const { targetOption } = this.getTarget(options);
		const listener = this.listeners.find(
			l =>
				l.events === events &&
				l.callback === callback &&
				this.areTargetsTheSame(l.target, targetOption)
		);

		if (listener) this.clearListener(listener);
	}

	private areTargetsTheSame(targetA: Target, targetB: Target): boolean {
		if (Array.isArray(targetA)) {
			if (!Array.isArray(targetB)) return false;

			return targetA.every((v, i) => targetB[i] === v);
		}

		return targetA === targetB;
	}

	private getTarget(options?: TargetOptions): {
		target: EventTarget | EventTarget[];
		targetOption: Target;
	} {
		const targetOption = options?.target ?? this.targetElement;
		let target: EventTarget | EventTarget[];

		if (isString(targetOption)) {
			const isAbsolute = options?.root;
			const multipleTargets = options?.multiple;
			const selectorBase = isAbsolute ? document : this.targetElement;
			const newTarget = multipleTargets
				? Array.from(selectorBase.querySelectorAll(targetOption))
				: selectorBase.querySelector(targetOption);

			if (!newTarget || (Array.isArray(newTarget) && !newTarget.length)) {
				const errorMessage = `Could not find element${
					multipleTargets ? 's' : ''
				} with selector '${targetOption}' ${
					isAbsolute ? 'in document' : 'relatively to current element'
				}`;

				throw Error(logger.getMessage(errorMessage));
			}

			target = newTarget;
		} else {
			target = targetOption;
		}

		return { target, targetOption };
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
