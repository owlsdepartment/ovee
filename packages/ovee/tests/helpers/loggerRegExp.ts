import { FRAMEWORK_NAME } from '@/constants';

export function createLoggerRegExp(part: string) {
	return new RegExp(`^\\[${FRAMEWORK_NAME} ~ ${part}\\]`);
}
