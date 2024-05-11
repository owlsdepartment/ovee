import { isNil } from '@/utils';

import { Fiber, FiberProps, FunctionFiber } from './types';

// const reservedAttributeKeys = ['children', 'innerHTML'];

export const isUpperCase = (letter: string) => !!letter && letter === letter.toUpperCase();

export const isEvent = (key: string) => key.startsWith('on') && isUpperCase(key[2]);

export const isAtrribute = (key: string) => key !== 'children';

export const isNew = (prev: FiberProps, next: FiberProps) => (key: string) =>
	prev[key] !== next[key];

export const isGone = (next: FiberProps) => (key: string) => !(key in next);

export const isFunctionFiber = (fiber: Fiber): fiber is FunctionFiber =>
	typeof fiber.type === 'function';

export const areFibersSame = (fiberA: Fiber | undefined, fiberB: Fiber | undefined): boolean => {
	const areSame = fiberA && fiberB && fiberA.type === fiberB.type;

	if (!areSame) return false;

	const keyA = fiberA.key;
	const keyB = fiberB.key;

	if (!isNil(keyA) && !isNil(keyB)) return keyA === keyB;

	return areSame;
};
