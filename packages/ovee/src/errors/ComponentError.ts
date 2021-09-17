import Component from 'src/core/Component';

export default class ComponentError extends Error {
	constructor(
		message: string,
		public readonly element: Element,
		public readonly component?: Component
	) {
		super(message);

		Error.captureStackTrace(this, ComponentError);
	}
}
