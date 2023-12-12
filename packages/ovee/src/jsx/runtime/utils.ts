import { Fiber, FiberProps, FunctionFiber } from './types';

export const isUpperCase = (letter: string) => letter === letter.toUpperCase();

export const isEvent = (key: string) => key.startsWith('on') && isUpperCase(key[2]);

export const isAtrribute = (key: string) => key !== 'children';

export const isNew = (prev: FiberProps, next: FiberProps) => (key: string) =>
	prev[key] !== next[key];

export const isGone = (next: FiberProps) => (key: string) => !(key in next);

export const isFunctionFiber = (fiber: Fiber): fiber is FunctionFiber =>
	typeof fiber.type === 'function';
