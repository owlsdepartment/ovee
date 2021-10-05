import { reactive } from '@vue/reactivity';
import { AnyObject } from 'src/utils/types';

export class ReactiveProxy {
	enabledProps: string[] = [];
	isDestroyed = false;

	readonly target!: AnyObject;
	readonly proxy!: AnyObject;

	constructor(target: AnyObject) {
		const proxy = reactive({});

		Object.defineProperty(this, 'target', {
			value: target,
			writable: false,
		});
		Object.defineProperty(this, 'proxy', {
			value: proxy,
			writable: false,
		});
	}

	enableFor(propertyName: string): void {
		if (this.enabledProps.includes(propertyName)) {
			return;
		}

		const { proxy, target } = this;
		const oldDescriptor = Object.getOwnPropertyDescriptor(target, propertyName);

		proxy[propertyName] = target[propertyName];
		Object.defineProperty(target, propertyName, {
			enumerable: oldDescriptor?.enumerable ?? true,
			configurable: oldDescriptor?.configurable ?? true,
			get() {
				return proxy[propertyName];
			},
			set(value) {
				proxy[propertyName] = value;
			},
		});

		this.enabledProps.push(propertyName);
	}
}
