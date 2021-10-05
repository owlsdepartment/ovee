/* eslint-disable @typescript-eslint/no-non-null-assertion */
type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;

export class Task<T = void> extends Promise<T> {
	public resolved: boolean;
	public rejected: boolean;
	public finished: boolean;

	public resolve: Resolve<T>;
	public reject: Reject;

	constructor() {
		let resolve: Resolve<T>;
		let reject: Reject;

		super((_resolve, _reject) => {
			resolve = _resolve;
			reject = _reject;
		});

		this.resolved = false;
		this.rejected = false;
		this.finished = false;

		this.resolve = (...args) => {
			this.resolved = true;
			this.finished = true;

			resolve!(...args);
		};
		this.reject = (...args) => {
			this.rejected = true;
			this.finished = true;

			reject!(...args);
		};
	}

	static get [Symbol.species]() {
		return Promise;
	}

	get [Symbol.toStringTag]() {
		return 'Task';
	}
}
