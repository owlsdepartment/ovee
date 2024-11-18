import { ModuleContext, ModuleOptions, ModuleReturn } from '.';
import { AnyObject } from '@/utils';

export type AnyModule = Module<any, any>;

export type GetModuleInstance<M extends AnyModule, Return = ReturnType<M>> = Return extends
	| void
	| undefined
	| null
	? AnyObject
	: Return;

export type GetModuleOptions<M extends AnyModule> = Parameters<M>[0]['options'];

export interface ModuleDefineFunction<
	Options extends ModuleOptions = ModuleOptions,
	Return extends ModuleReturn = ModuleReturn
> {
	(context: ModuleContext<Options>): Return;
}

export interface Module<
	Options extends ModuleOptions = ModuleOptions,
	Return extends ModuleReturn = ModuleReturn
> extends ModuleDefineFunction<Options, Return> {
	__ovee_module_definition: true;
}

export function defineModule<
	Options extends ModuleOptions = ModuleOptions,
	Return extends ModuleReturn = ModuleReturn
>(module: ModuleDefineFunction<Options, Return>): Module<Options, Return> {
	const _module = module as Module<Options, Return>;

	_module.__ovee_module_definition = true;

	return _module;
}
