import { JSDOM } from 'jsdom';

import App from 'src/core/App';
import Component from 'src/core/Component';
import * as protectedFields from 'src/core/protectedFields';
import instanceDecoratorFactory from 'src/utils/instanceDecoratorFactory';

const dom = new JSDOM('<!DOCTYPE html>');

describe('Instance Decorators System', () => {
    it('don\'t share decorators between extended components', () => {
        asyncHelper(async (calls) => {
            const element = dom.window.document.createElement('div');
            const app = new App();
            const decoratorCb1 = jest.fn();
            const decoratorCb2 = jest.fn();

            const decorator1 = instanceDecoratorFactory(decoratorCb1);
            const decorator2 = instanceDecoratorFactory(decoratorCb2);

            class Base extends Component {
                @decorator1()
                test: any
            }
            class Extended extends Base {
                @decorator2()
                test2: any
            }

            expect((Base.prototype.constructor as any)[protectedFields.INSTANCE_DECORATORS][0]).toBe(decorator1);
            expect((Extended.prototype.constructor as any)[protectedFields.INSTANCE_DECORATORS][0]).toBe(decorator2);

            const instance = new Extended(element, app);

            await calls();

            expect(decorator1).toHaveBeenCalledTimes(1);
            expect(decorator1).toHaveBeenCalledWith(instance);
            expect(decorator2).toHaveBeenCalledTimes(1);
            expect(decorator2).toHaveBeenCalledWith(instance);
        });
    });
});
