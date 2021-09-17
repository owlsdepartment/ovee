import InstanceDecorators from 'src/core/InstanceDecorators';
import * as protectedFields from 'src/core/protectedFields';
import { WithElement } from 'src/core/types';

interface DecoratorsHandler extends Required<typeof InstanceDecorators> {
	init(): void;
	destroy(): void;
}

type Options = WithElement;

export function createDecoratorsHandler<T extends object, O extends Options>(
	base: T,
	options?: O
): T & O & DecoratorsHandler {
	class Handler extends InstanceDecorators {
		init() {
			this[protectedFields.INITIALIZE_DECORATORS]();
		}

		destroy() {
			this[protectedFields.DESTROY_DECORATORS]();
		}
	}
	const ret = new Handler();

	Object.assign(ret, base);
	Object.assign(ret, options);

	return ret as any;
}
