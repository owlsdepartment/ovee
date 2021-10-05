import InstanceDecorators from 'src/core/InstanceDecorators';
import * as protectedFields from 'src/core/protectedFields';

import { instanceDecoratorDestructor } from './instanceDecoratorDestructor';
import { AnyObject } from './types';

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
	addDestructor: AddDestructor;
}

export type AddDestructor = (cb: (instance: any) => any) => void;

function instanceDecoratorFactory<T, Cb extends DecoratorFactoryCallback<T>>(
	callback: Cb
): ExtractDecorator<T, Cb> {
	return (...args) =>
		(target, prop) => {
			const ctor = target.constructor as typeof InstanceDecorators;
			const addDestructor: AddDestructor = cb => instanceDecoratorDestructor(target, cb);
			const hasInstanceDecorators = Object.prototype.hasOwnProperty.call(
				ctor,
				protectedFields.INSTANCE_DECORATORS
			);

			if (!hasInstanceDecorators) {
				ctor[protectedFields.INSTANCE_DECORATORS] = [];
			}

			ctor[protectedFields.INSTANCE_DECORATORS]!.push(instance =>
				callback({ instance, proto: Object.getPrototypeOf(instance), addDestructor }, prop, ...args)
			);
		};
}

export default instanceDecoratorFactory;
