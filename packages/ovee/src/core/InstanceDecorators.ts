import { forEachStaticPrototype } from 'src/utils';

import {
	DESTROY_DECORATORS,
	INITIALIZE_DECORATORS,
	INSTANCE_DECORATORS,
	INSTANCE_DECORATORS_DESTRUCTORS,
} from './protectedFields';

export type InitDecoratorCb = (ctx: any) => any;
export type DestroyDecoratorCb = (ctx: any) => any;

export class InstanceDecorators {
	static [INSTANCE_DECORATORS]?: InitDecoratorCb[];

	[INSTANCE_DECORATORS_DESTRUCTORS]?: DestroyDecoratorCb[];

	[INITIALIZE_DECORATORS](): void {
		forEachStaticPrototype<typeof InstanceDecorators>(this, ctor => {
			ctor[INSTANCE_DECORATORS]?.forEach(fn => fn(this));
		});
	}

	[DESTROY_DECORATORS](): void {
		this[INSTANCE_DECORATORS_DESTRUCTORS]?.forEach(fn => fn(this));
	}
}
