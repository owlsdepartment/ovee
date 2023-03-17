import { Module } from '@/core';

export function isModuleDefinition(value: any): value is Module {
	return typeof value === 'function' && (value as Module).__ovee_module_definition === true;
}
