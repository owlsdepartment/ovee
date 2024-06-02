export abstract class MutationObserverManager {
	abstract observer: MutationObserver;
	abstract observeOptions: MutationObserverInit;

	connected = false;

	protected constructor(public element: HTMLElement) {}

	connect() {
		if (this.connected) return;

		this.connected = true;
		this.observer.observe(this.element, this.observeOptions);
	}

	disconnect() {
		if (!this.connected) return;

		this.connected = false;
		this.observer.disconnect();
	}
}
