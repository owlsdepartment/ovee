import { WithDataParam, WithElement } from 'src/core/types';
import { Logger } from 'src/errors';
import instanceDecoratorFactory, { DecoratorContext } from 'src/utils/instanceDecoratorFactory';
import toKebabCase from 'src/utils/toKebabCase';

type Target = WithDataParam & WithElement;

const logger = new Logger('@dataParam');

export default instanceDecoratorFactory(
	(
		{ instance, addDestructor }: DecoratorContext<Target>,
		dataParamName,
		dataParamOverrideName?: string
	) => {
		if (typeof (instance as any)[dataParamName] === 'function') {
			return logger.error(`Decorator should only be applied to a property`);
		}

		const datasetKey = dataParamOverrideName || dataParamName;

		if (!instance.__dataParams) {
			instance.__dataParams = {};
		}

		instance.__dataParams[dataParamName] = () => {
			if ((instance.$element as HTMLElement).dataset[datasetKey] !== undefined) {
				(instance as any)[dataParamName] = (instance.$element as any).dataset[datasetKey];
			}
		};

		instance.__dataParams[dataParamName]();

		const observer = new MutationObserver(mutations => {
			mutations.forEach(({ attributeName }) => {
				if (attributeName === `data-${toKebabCase(datasetKey)}`) {
					instance.__dataParams![dataParamName]();
				}
			});
		});

		observer.observe(instance.$element, {
			attributes: true,
			childList: false,
			characterData: false,
		});

		addDestructor(() => {
			observer.disconnect();
		});
	}
);
