import { Logger } from 'src/errors';
import toKebabCase from 'src/utils/toKebabCase';

const logger = new Logger('@register');

function decorate(target: any, name: string) {
	if (!name) {
		logger.error('Component name must be provided', target);
		return target;
	}

	if (!target.prototype) {
		logger.error('Decorator works only for classes', target);
		return target;
	}

	name = toKebabCase(name);

	if (!name.includes('-')) {
		logger.error('Component name must consist of at least two words', target);
		return target;
	}

	target.getName = function getName() {
		return name;
	};

	return target;
}

export default function (name: string) {
	return (target: any): any => decorate(target, name);
}
