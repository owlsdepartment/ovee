import * as protectedFields from 'src/core/protectedFields';
import { WithInstanceDestructors } from 'src/core/types';

type Callback<T> = (ctx: T) => any

function instanceDecoratorDestructor<T>(instance: T & WithInstanceDestructors, callback: Callback<T>): void {
    if (typeof (callback) !== 'function') {
        console.error('callback passed to instanceDecoratorDestructor should be a function');
        return;
    }

    if (!instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]) {
        instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS] = [];
    }

    instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]!.push(callback);
}

export default instanceDecoratorDestructor;
