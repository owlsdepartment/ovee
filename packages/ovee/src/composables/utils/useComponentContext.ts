import { injectComponentContext } from '@/core/component/componentContext';
import { ComponentOptions } from '@/core/component/defineComponent';
import { ComponentContext } from '@/core/component/types';
import { Logger } from '@/errors';

const logger = new Logger('useComponentContext');

export interface ComponentPublicInstance<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
> extends ComponentContext<Options> {
	element: Root;
}

export function useComponentContext<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
>(allowMissingContext?: boolean): ComponentPublicInstance<Root, Options>;

export function useComponentContext<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
>(allowMissingContext: true): ComponentPublicInstance<Root, Options> | null;

export function useComponentContext<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions
>(allowMissingContext = false): ComponentPublicInstance<Root, Options> | null {
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
		name: instance.name,
		app: instance.app,
		options: instance.options as Options,
		element: instance.element as Root,

		emit: (...args) => instance.emit(...args),
		on: (...args) => instance.on(...args),
		off: (...args) => instance.off(...args),
	};
}
