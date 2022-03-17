import { DestroyDecoratorCb, InstanceDecorators } from 'src/core/InstanceDecorators';
import * as protectedFields from 'src/core/protectedFields';
import { Logger } from 'src/errors';

const logger = new Logger('instanceDecoratorDestructor');

export function instanceDecoratorDestructor(
	instance: InstanceDecorators,
	callback: DestroyDecoratorCb
): void {
	if (typeof callback !== 'function') {
		logger.error('callback passed to instanceDecoratorDestructor should be a function');

		return;
	}

	if (!instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]) {
		instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS] = [];
	}

	instance[protectedFields.INSTANCE_DECORATORS_DESTRUCTORS]!.push(callback);
}
