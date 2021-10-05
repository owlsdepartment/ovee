import App from 'src/core/App';
import Component from 'src/core/Component';
import { ClassConstructor } from 'src/utils';

/**
 * NOTE: there is a problem with decorators init 'cause asyncHelper changes setTimeout into synchronous function
 */
export async function createComponentAsync<C extends Component>(
	ctor: ClassConstructor<C>
): Promise<C> {
	let ret: any;

	await asyncHelper(async calls => {
		const element = document.createElement('div');
		const app = new App();
		ret = new ctor(element, app);

		await calls();
	});

	return ret;
}

export function createComponent<C extends Component>(
	ctor: ClassConstructor<C>,
	optional: { element?: Element; app?: App } = {}
): C {
	jest.useFakeTimers();

	const element = optional.element ?? document.createElement('div');
	const app = optional.app ?? new App();
	const component = new ctor(element, app);

	jest.runAllTimers();
	jest.useRealTimers();

	return component;
}
