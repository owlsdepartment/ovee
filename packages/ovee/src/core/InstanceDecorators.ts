import forEachStaticPrototype from 'src/utils/forEachStaticPrototype';

import {
	DESTROY_DECORATORS,
	INITIALIZE_DECORATORS,
	INSTANCE_DECORATORS,
	INSTANCE_DECORATORS_DESTRUCTORS
} from './protectedFields';

export default class InstanceDecorators {
	static [INSTANCE_DECORATORS]?: ((ctx: any) => any)[];
	static [INSTANCE_DECORATORS_DESTRUCTORS]?: ((ctx: any) => any)[];

	[INITIALIZE_DECORATORS](): void {
		forEachStaticPrototype<typeof InstanceDecorators>(this, ctor => {
			if (ctor[INSTANCE_DECORATORS]) {
				ctor[INSTANCE_DECORATORS]?.forEach(fn => fn(this));

				delete ctor[INSTANCE_DECORATORS];
			}
		});
	}

	[DESTROY_DECORATORS](): void {
		forEachStaticPrototype<typeof InstanceDecorators>(this, ctor => {
			if (ctor[INSTANCE_DECORATORS_DESTRUCTORS]) {
				ctor[INSTANCE_DECORATORS_DESTRUCTORS]!.forEach(fn => fn(this));

				delete ctor[INSTANCE_DECORATORS_DESTRUCTORS];
			}
		});
	}
}
