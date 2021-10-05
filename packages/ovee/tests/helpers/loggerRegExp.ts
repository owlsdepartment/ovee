import { FRAMEWORK_NAME } from 'src/constants';

export function createLoggerRegExp(part: string) {
	return new RegExp(`^\\[${FRAMEWORK_NAME} ~ ${part}\\]`);
}
