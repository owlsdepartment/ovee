import { injectComponentContext } from '@/core/component/componentContext';
import { ComponentOptions, ComponentProps } from '@/core/component/defineComponent';
import { ComponentContext } from '@/core/component/types';
import { Logger } from '@/errors';

const logger = new Logger('useComponentContext');

export interface ComponentPublicInstance<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends ComponentProps = ComponentProps
> extends ComponentContext<Options, Props> {
	element: Root;
}

export function useComponentContext<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends ComponentProps = ComponentProps
>(allowMissingContext?: boolean): ComponentPublicInstance<Root, Options, Props>;

export function useComponentContext<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends ComponentProps = ComponentProps
>(allowMissingContext: true): ComponentPublicInstance<Root, Options, Props> | null;

export function useComponentContext<
	Root extends HTMLElement = HTMLElement,
	Options extends ComponentOptions = ComponentOptions,
	Props extends ComponentProps = ComponentProps
>(allowMissingContext = false): ComponentPublicInstance<Root, Options, Props> | null {
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
		element: instance.element as Root,
		name: instance.name,
		app: instance.app,
		options: instance.options as Options,
		props: instance.props as Props,

		emit: (...args) => instance.emit(...args),
		on: (...args) => instance.on(...args),
		off: (...args) => instance.off(...args),
	};
}
