import * as protectedFields from 'src/core/protectedFields';
import { WithInstanceDecorators, WithInstanceDestructors, WithElement } from 'src/core/types';

interface DecoratorsHandler extends Required<WithInstanceDecorators & WithInstanceDestructors> {
    init(): void;
    destroy(): void;
}

interface Options extends WithElement {}

function createDecoratorsHandler<
    T extends object, O extends Options
>(base: T, options?: O): T & DecoratorsHandler & O {
    return {
        ...base,
        ...options ?? {} as any,
        [protectedFields.INSTANCE_DECORATORS]: [],
        [protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]: [],

        init() {
            this[protectedFields.INSTANCE_DECORATORS].forEach((fn) => fn(this));
        },

        destroy() {
            this[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS].forEach((fn) => fn(this));
        }
    };
}

export default createDecoratorsHandler;
