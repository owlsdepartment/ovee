import { Logger } from '@/errors';

import { injectComponentContext } from '../component';
import { injectModuleContext } from '../module';
import { App } from './App';

const logger = new Logger('useApp');

export function useApp(allowMissingContext?: boolean): App;
export function useApp(allowMissingContext: true): App | null;

export function useApp(allowMissingContext = false): App | null {
	const context = injectModuleContext(true) || injectComponentContext(true);

	if (!context && !allowMissingContext) {
		throw Error(
			logger.getMessage(
				`Missing app context. Did you used 'useApp' inside setup function of module or component?`
			)
		);
	}

	if (!context) return null;

	return context.app;
}
