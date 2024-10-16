import { Component } from '@/core';

export function isComponentDefinition(value: any): value is Component {
	return typeof value === 'function' && (value as Component).__ovee_component_definition === true;
}
