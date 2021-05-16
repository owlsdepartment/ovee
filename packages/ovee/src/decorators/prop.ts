import { WithElement } from 'src/core/types';
import instanceDecoratorFactory, { DecoratorContext } from 'src/utils/instanceDecoratorFactory';

export default instanceDecoratorFactory((
    { instance }: DecoratorContext<WithElement>, instancePropName, elementPropName?: string
) => {
    const originalKey = Symbol(instancePropName);

    elementPropName = elementPropName || instancePropName;

    if (typeof (instance as any)[instancePropName] === 'function') {
        console.error('Prop decorator should be only applied to a property');
    } else {
        Reflect.set(instance, instancePropName, Reflect.get(instance.$element, elementPropName));
        Reflect.set(instance.$element, originalKey, Reflect.get(instance.$element, elementPropName));

        Object.defineProperty(instance.$element, elementPropName, {
            configurable: true,
            get() {
                return Reflect.get(instance.$element, originalKey);
            },
            set(v) {
                Reflect.set(instance.$element, originalKey, v);
                Reflect.set(instance, instancePropName, v);
            }
        });
    }
});
