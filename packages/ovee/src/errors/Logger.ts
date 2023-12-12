import { FRAMEWORK_NAME } from '@/constants';
import { isString } from '@/utils';

type LogLevel = 'log' | 'warn' | 'info' | 'error';

const DEFAULT_CONNECTOR = ' ~ ';

export class Logger {
	constructor(
		public subnamespace = '',
		public namespace = FRAMEWORK_NAME,
		public connector = DEFAULT_CONNECTOR
	) {}

	get basePrefix(): string {
		return this.createPrefix([this.namespace, this.subnamespace]);
	}

	private createPrefix(parts: string[]) {
		const prefix = parts.filter(p => !!p).join(this.connector);

		return `[${prefix}]`;
	}

	private logMessage(level: LogLevel, args: any[], prefixParts: string[] = []) {
		const logArgs = [...args];
		const logMethod = console[level];

		if (args.length === 0) {
			logMethod(...logArgs);

			return;
		}

		const firstArg = logArgs[0];
		const baseMessage = isString(firstArg) ? firstArg : '';
		const message = this.getMessage(baseMessage, prefixParts);

		if (isString(firstArg)) {
			logArgs[0] = message;
		} else {
			logArgs.unshift(message);
		}

		logMethod(...logArgs);
	}

	getMessage(message: string, prefixParts: string[] = []) {
		const prefix =
			prefixParts.length === 0
				? this.basePrefix
				: this.createPrefix([this.namespace, this.subnamespace, ...prefixParts]);

		return message ? `${prefix} ${message}` : prefix;
	}

	log(...args: any[]) {
		this.logMessage('log', args);
	}

	logSpecific(prefixParts: string[], ...args: any[]) {
		this.logMessage('log', args, prefixParts);
	}

	warn(...args: any[]) {
		this.logMessage('warn', args);
	}

	warnSpecific(prefixParts: string[], ...args: any[]) {
		this.logMessage('warn', args, prefixParts);
	}

	info(...args: any[]) {
		this.logMessage('info', args);
	}

	infoSpecific(prefixParts: string[], ...args: any[]) {
		this.logMessage('info', args, prefixParts);
	}

	error(...args: any[]) {
		this.logMessage('error', args);
	}

	errorSpecific(prefixParts: string[], ...args: any[]) {
		this.logMessage('error', args, prefixParts);
	}
}
