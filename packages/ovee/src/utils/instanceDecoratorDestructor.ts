import InstanceDecorators from 'src/core/InstanceDecorators';
import * as protectedFields from 'src/core/protectedFields';

type Callback<T> = (ctx: T) => any

function instanceDecoratorDestructor<T = any>(target: any, callback: Callback<T>): void {
    if (typeof callback !== 'function') {
        console.error('callback passed to instanceDecoratorDestructor should be a function');

        return;
    }

    const ctor = target.constructor as typeof InstanceDecorators;

    if (!ctor[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]) {
        ctor[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS] = [];
    }

    ctor[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]!.push(callback);
}

export default instanceDecoratorDestructor;
