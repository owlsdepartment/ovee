type Callback = () => void;

interface Registered {
	once: boolean;
	cb: Callback;
}

export class EventBus {
	private registered = new Array<Registered>();

	emit() {
		const toClean = new Array<Registered>();

		this.registered.forEach(r => {
			r.cb();

			if (r.once) toClean.push(r);
		});

		toClean.forEach(r => {
			const idx = this.registered.indexOf(r);

			this.remove(idx);
		});
	}

	on(cb: Callback, once = false) {
		this.registered.push({ cb, once });
	}

	off(cb: Callback) {
		const idx = this.registered.findIndex(r => r.cb === cb);

		this.remove(idx);
	}

	private remove(idx: number) {
		if (idx < 0) return;

		this.registered.splice(idx, 1);
	}
}
