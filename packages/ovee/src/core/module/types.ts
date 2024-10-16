import { AnyObject } from '@/utils';

import { App } from '../app';

export type ModuleOptions = AnyObject;
export type ModuleReturn = AnyObject | void;

export interface ModuleContext<Options extends ModuleOptions = ModuleOptions> {
	options: Options;
	app: App;
}
