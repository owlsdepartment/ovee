import { AnyObject, OmitConstructor } from '../utils';
import App from './App';

export type ModuleOptions = AnyObject;

export type ModuleClass = OmitConstructor<typeof Module> &
	(new (app: App, options?: ModuleOptions) => Module);

abstract class Module<Options = ModuleOptions> {
	$app!: App;
	options!: Options;

	constructor(app: App, options: Partial<Options> = {}) {
		Object.defineProperties(this, {
			$app: {
				writable: false,
				configurable: false,
				value: app,
			},
			options: {
				writable: true,
				configurable: false,
				value: { ...options },
			},
		});
	}

	abstract init(): void;

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	destroy(): void {}

	static getName(): string {
		throw new Error('Module class needs to implement static getName() method');
	}
}

export default Module;
