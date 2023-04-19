import { Logger } from '@/errors';

import { injectComponentContext } from './componentContext';
import { ComponentOptions } from './defineComponent';
import { ComponentInstance } from './types';

const logger = new Logger('useComponent');

export function useComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
>(allowMissingContext?: boolean): ComponentInstance<Root, Options>;

export function useComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
>(allowMissingContext: true): ComponentInstance<Root, Options> | null;

export function useComponent<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
>(allowMissingContext = false): ComponentInstance<Root, Options> | null {
	const instance = injectComponentContext();

	if (!instance && !allowMissingContext) {
		throw Error(
			logger.getMessage(
				`Missing component context. Did you used 'useComponent' inside components setup function?`
			)
		);
	}

	if (!instance) return null;

	return {
		app: instance.app,
		options: instance.options as Options,
		element: instance.element as Root,

		emit: (...args) => instance.emit(...args),
		on: (...args) => instance.on(...args),
		off: (...args) => instance.off(...args),
	};
}
