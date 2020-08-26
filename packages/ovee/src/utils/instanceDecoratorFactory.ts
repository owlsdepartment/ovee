import * as protectedFields from 'src/core/protectedFields';
import { WithInstanceDecorators } from 'src/core/types';

export type ExtractDecorator<T, F extends DecoratorFactoryCallback<T>> =
    (...args: ExtractRest<F>) => (target: WithInstanceDecorators, prop: string) => void

export type DecoratorFactoryCallback<T extends WithInstanceDecorators> =
    (instance: T, prop: string, ...rest: any[]) => any;

type ExtractRest<F extends (...args: any) => any> =
    F extends (arg1: any, arg2: any, ...rest: infer R) => any ? R : never

function instanceDecoratorFactory<T, Cb extends DecoratorFactoryCallback<T>>(callback: Cb): ExtractDecorator<T, Cb> {
    return (...args) => (target: WithInstanceDecorators, prop: string) => {
        if (!target[protectedFields.INSTANCE_DECORATORS]) {
            target[protectedFields.INSTANCE_DECORATORS] = [];
        }

        target[protectedFields.INSTANCE_DECORATORS]!.push(
            (instance) => callback(instance, prop, ...args)
        );
    };
}

export default instanceDecoratorFactory;
