import { isString } from 'src/utils/isString';

type LogLevel = 'log' | 'warn' | 'info' | 'error';

export class Logger {
	constructor(public subnamespace = '', public namespace = 'Ovee') {}

	get basePrefix(): string {
		return this.createPrefix([this.namespace, this.subnamespace]);
	}

	private createPrefix(parts: string[]) {
		const prefix = parts.filter(p => !!p).join(' ~ ');

		return `[${prefix}]`;
	}

	private logMessage(level: LogLevel, args: any[], prefixParts: string[] = []) {
		const logArgs = [...args];
		const logMethod = console[level];

		if (args.length === 0) {
			logMethod(...logArgs);

			return;
		}

		const prefix =
			prefixParts.length === 0
				? this.basePrefix
				: this.createPrefix([this.namespace, this.subnamespace, ...prefixParts]);

		if (isString(logArgs[0])) {
			logArgs[0] = `${prefix} ${logArgs[0]}`;
		} else {
			logArgs.unshift(prefix);
		}

		logMethod(...logArgs);
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
