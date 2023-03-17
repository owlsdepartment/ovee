import { Module, ModuleOptions } from './defineModule';

// TODO: specific interface
export type CreatedModule = ReturnType<typeof createModule>;

export function createModule(module: Module, _options?: ModuleOptions) {
	// TODO: provide context
	const options = _options || {};
	const instance = module(options);

	return {
		instance,
		options,

		init: () => {
			// TODO: call registered init
		},
		destroy: () => {
			// TODO: call registered destroy
		},
	};
}
