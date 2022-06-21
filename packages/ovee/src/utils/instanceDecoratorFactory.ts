import { InstanceDecorators } from 'src/core/InstanceDecorators';
import * as protectedFields from 'src/core/protectedFields';

import { instanceDecoratorDestructor } from './instanceDecoratorDestructor';
import { AnyObject } from './types';

export type PropType = 'field' | 'getter' | 'setter' | 'method';

export type ExtractDecorator<T, F extends DecoratorFactoryCallback<T>> = (
	...args: ExtractRest<F>
) => (target: any, prop: string) => void;

type ExtractRest<F extends (...args: any) => any> = F extends (
	arg1: any,
	arg2: any,
	...rest: infer R
) => any
	? R
	: never;

export type DecoratorFactoryCallback<T> = (
	ctx: DecoratorContext<T>,
	prop: string,
	...rest: any[]
) => any;

export interface DecoratorContext<T = AnyObject, P = AnyObject> {
	instance: T & AnyObject;
	proto: P;
	type: PropType[];
	addDestructor: AddDestructor;
}

export type AddDestructor = (cb: (instance: any) => any) => void;

export function instanceDecoratorFactory<T, Cb extends DecoratorFactoryCallback<T>>(
	callback: Cb
): ExtractDecorator<T, Cb> {
	return (...args) =>
		(target, prop) => {
			const ctor = target.constructor as typeof InstanceDecorators;
			const hasInstanceDecorators = Object.prototype.hasOwnProperty.call(
				ctor,
				protectedFields.INSTANCE_DECORATORS
			);

			if (!hasInstanceDecorators) {
				ctor[protectedFields.INSTANCE_DECORATORS] = [];
			}

			const type = getPropType(target, prop);

			ctor[protectedFields.INSTANCE_DECORATORS]!.push(instance => {
				const addDestructor: AddDestructor = cb => instanceDecoratorDestructor(instance, cb);

				callback(
					{ instance, proto: Reflect.getPrototypeOf(instance)!, addDestructor, type },
					prop,
					...args
				);
			});
		};
}

function getPropType(proto: any, key: string): PropType[] {
	const descriptor = Reflect.getOwnPropertyDescriptor(proto, key);

	if (!descriptor) return ['field'];

	const { get, set } = descriptor;
	const output: PropType[] = [];

	if (get && typeof get === 'function') output.push('getter');
	if (set && typeof set === 'function') output.push('setter');

	if (output.length > 0) return output;

	return ['method'];
}
