import { injectComponentContext } from '@/core/component/componentContext';
import { ComponentOptions } from '@/core/component/defineComponent';
import { ComponentContext } from '@/core/component/types';
import { Logger } from '@/errors';

const logger = new Logger('useComponentContext');

export interface ComponentPublicInstance extends ComponentContext {
	element: HTMLElement;
	options: ComponentOptions;
}

export function useComponentContext(allowMissingContext?: boolean): ComponentPublicInstance;
export function useComponentContext(allowMissingContext: true): ComponentPublicInstance | null;

export function useComponentContext(allowMissingContext = false): ComponentPublicInstance | null {
	const instance = injectComponentContext();

	if (!instance && !allowMissingContext) {
		throw Error(
			logger.getMessage(
				`Missing component context. Did you used 'useComponent' inside components setup function?`
			)
		);
	}

	if (!instance) return null;

	// TODO: use normal instance type
	return {
		element: instance.element,
		name: instance.name,
		app: instance.app,
		options: instance.options,
		props: instance.props,

		emit: (...args) => instance.emit(...args),
		on: (...args) => instance.on(...args),
		off: (...args) => instance.off(...args),
	};
}
