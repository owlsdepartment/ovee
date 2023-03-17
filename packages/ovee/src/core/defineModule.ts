import { AnyObject } from '@/utils';

export type ModuleOptions = AnyObject;
export type ModuleReturn = AnyObject | void;

export interface ModuleDefineFunction<
	O extends ModuleOptions = ModuleOptions,
	R extends ModuleReturn = ModuleReturn
> {
	(o: Partial<O>): R;
}

export type GetModuleInstance<M extends Module, Return = ReturnType<M>> = Return extends
	| void
	| undefined
	| null
	? AnyObject
	: Return;

export type GetModuleOptions<M extends Module> = Parameters<M>[0];

export interface Module<
	O extends ModuleOptions = ModuleOptions,
	R extends ModuleReturn = ModuleReturn
> extends ModuleDefineFunction<O, R> {
	__ovee_module_definition: true;
}

export function defineModule<
	O extends ModuleOptions = ModuleOptions,
	R extends ModuleReturn = ModuleReturn
>(module: ModuleDefineFunction<O, R>): Module<O, R> {
	const _module = module as Module<O, R>;

	_module.__ovee_module_definition = true;

	return _module;
}
