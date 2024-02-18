import { runThrowable } from './runThrowable';

type Callback<Data> = Data extends undefined ? (d?: Data) => void : (d: Data) => void;

interface Registered<Data> {
	once: boolean;
	cb: Callback<Data>;
}

export class EventBus<Data = undefined> {
	private registered = new Array<Registered<Data>>();

	constructor(public name: string) {}

	emit(...d: Data extends undefined ? [d?: Data] : [d: Data]) {
		const toClean = new Array<Registered<Data>>();

		this.registered.forEach(r => {
			runThrowable(this.name, () => r.cb(...(d as [d: Data])));

			if (r.once) toClean.push(r);
		});

		toClean.forEach(r => {
			const idx = this.registered.indexOf(r);

			this.remove(idx);
		});
	}

	on(cb: Callback<Data>, once = false) {
		this.registered.push({ cb, once });
	}

	off(cb: Callback<Data>) {
		const idx = this.registered.findIndex(r => r.cb === cb);

		this.remove(idx);
	}

	private remove(idx: number) {
		if (idx < 0) return;

		this.registered.splice(idx, 1);
	}
}
