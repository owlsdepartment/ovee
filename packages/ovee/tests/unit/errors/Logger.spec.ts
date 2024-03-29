import { Logger } from 'src/errors';

describe('Logger class', () => {
	const logSpy = spyConsole('log');
	const infoSpy = spyConsole('info');
	const warnSpy = spyConsole('warn');
	const errorSpy = spyConsole('error');

	it('creates proper base prefix', () => {
		const subnamespace = 'test subnamespace';
		const namespace = 'test namespace';
		const logger1 = new Logger();
		const logger2 = new Logger(subnamespace);
		const logger3 = new Logger('', '');
		const logger4 = new Logger(subnamespace, namespace);

		expect(logger1.basePrefix).toMatch('[Ovee.js]');
		expect(logger2.basePrefix).toMatch(`[Ovee.js ~ ${subnamespace}]`);
		expect(logger3.basePrefix).toMatch(`[]`);
		expect(logger4.basePrefix).toMatch(`[${namespace} ~ ${subnamespace}]`);
	});

	it('allows for custom connector', () => {
		const subnamespace = 'test subnamespace';
		const namespace = 'test namespace';
		const connector1 = ' | ';
		const connector2 = ' - ';
		const logger = new Logger(subnamespace, namespace, connector1);

		expect(logger.basePrefix).toMatch(`[${namespace}${connector1}${subnamespace}]`);

		logger.connector = connector2;

		expect(logger.basePrefix).toMatch(`[${namespace}${connector2}${subnamespace}]`);
	});

	describe('log', () => {
		it(`adds proper prefix to console.log when message is string, otherwise appends it at the beginning`, () => {
			const basePrefix = '[Ovee.js ~ test]';
			const logger = new Logger('test');
			const message = 'some message';
			const firstObj = {};
			const secondObj = {};

			logger.log(message);
			logger.log(firstObj);
			logger.log(firstObj, secondObj);
			logger.log();

			expect(logSpy.console).toBeCalledTimes(4);
			expect(logSpy.console.mock.calls[0][0]).toMatch(`${basePrefix} ${message}`);
			expect(logSpy.console.mock.calls[1][0]).toMatch(basePrefix);
			expect(logSpy.console.mock.calls[2][0]).toMatch(basePrefix);
			expect(logSpy.console.mock.calls[1][1]).toBe(firstObj);
			expect(logSpy.console.mock.calls[2][1]).toBe(firstObj);
			expect(logSpy.console.mock.calls[2][2]).toBe(secondObj);
			expect(logSpy.console.mock.calls[3]).toEqual([]);
		});
	});

	describe('logSpecific', () => {
		it('allows to add more parts to prefix for console.log', () => {
			const basePrefix = 'Ovee.js ~ test';
			const logger = new Logger('test');
			const message = 'some message';
			const parts = ['a', 'b'];

			logger.logSpecific([], message);
			logger.logSpecific(['a'], message);
			logger.logSpecific([...parts], message);

			expect(logSpy.console).toBeCalledTimes(3);
			expect(logSpy.console.mock.calls[0][0]).toMatch(`[${basePrefix}] ${message}`);
			expect(logSpy.console.mock.calls[1][0]).toMatch(`[${basePrefix} ~ a] ${message}`);
			expect(logSpy.console.mock.calls[2][0]).toMatch(`[${basePrefix} ~ a ~ b] ${message}`);
		});
	});

	describe('info', () => {
		it('adds proper prefix to console.info when message is string, otherwise appends it at the beginning', () => {
			const basePrefix = '[Ovee.js ~ test]';
			const logger = new Logger('test');
			const message = 'some message';
			const firstObj = {};
			const secondObj = {};

			logger.info(message);
			logger.info(firstObj);
			logger.info(firstObj, secondObj);
			logger.info();

			expect(infoSpy.console).toBeCalledTimes(4);
			expect(infoSpy.console.mock.calls[0][0]).toMatch(`${basePrefix} ${message}`);
			expect(infoSpy.console.mock.calls[1][0]).toMatch(basePrefix);
			expect(infoSpy.console.mock.calls[2][0]).toMatch(basePrefix);
			expect(infoSpy.console.mock.calls[1][1]).toBe(firstObj);
			expect(infoSpy.console.mock.calls[2][1]).toBe(firstObj);
			expect(infoSpy.console.mock.calls[2][2]).toBe(secondObj);
			expect(infoSpy.console.mock.calls[3]).toEqual([]);
		});
	});

	describe('infoSpecific', () => {
		it('allows to add more parts to prefix for console.log', () => {
			const basePrefix = 'Ovee.js ~ test';
			const logger = new Logger('test');
			const message = 'some message';
			const parts = ['a', 'b'];

			logger.infoSpecific([], message);
			logger.infoSpecific(['a'], message);
			logger.infoSpecific([...parts], message);

			expect(infoSpy.console).toBeCalledTimes(3);
			expect(infoSpy.console.mock.calls[0][0]).toMatch(`[${basePrefix}] ${message}`);
			expect(infoSpy.console.mock.calls[1][0]).toMatch(`[${basePrefix} ~ a] ${message}`);
			expect(infoSpy.console.mock.calls[2][0]).toMatch(`[${basePrefix} ~ a ~ b] ${message}`);
		});
	});

	describe('warn', () => {
		it('adds proper prefix to console.warn when message is string, otherwise appends it at the beginning', () => {
			const basePrefix = '[Ovee.js ~ test]';
			const logger = new Logger('test');
			const message = 'some message';
			const firstObj = {};
			const secondObj = {};

			logger.warn(message);
			logger.warn(firstObj);
			logger.warn(firstObj, secondObj);
			logger.warn();

			expect(warnSpy.console).toBeCalledTimes(4);
			expect(warnSpy.console.mock.calls[0][0]).toMatch(`${basePrefix} ${message}`);
			expect(warnSpy.console.mock.calls[1][0]).toMatch(basePrefix);
			expect(warnSpy.console.mock.calls[2][0]).toMatch(basePrefix);
			expect(warnSpy.console.mock.calls[1][1]).toBe(firstObj);
			expect(warnSpy.console.mock.calls[2][1]).toBe(firstObj);
			expect(warnSpy.console.mock.calls[2][2]).toBe(secondObj);
			expect(warnSpy.console.mock.calls[3]).toEqual([]);
		});
	});

	describe('warnSpecific', () => {
		it('allows to add more parts to prefix for console.log', () => {
			const basePrefix = 'Ovee.js ~ test';
			const logger = new Logger('test');
			const message = 'some message';
			const parts = ['a', 'b'];

			logger.warnSpecific([], message);
			logger.warnSpecific(['a'], message);
			logger.warnSpecific([...parts], message);

			expect(warnSpy.console).toBeCalledTimes(3);
			expect(warnSpy.console.mock.calls[0][0]).toMatch(`[${basePrefix}] ${message}`);
			expect(warnSpy.console.mock.calls[1][0]).toMatch(`[${basePrefix} ~ a] ${message}`);
			expect(warnSpy.console.mock.calls[2][0]).toMatch(`[${basePrefix} ~ a ~ b] ${message}`);
		});
	});

	describe('error', () => {
		it('adds proper prefix to console.error when message is string, otherwise appends it at the beginning', () => {
			const basePrefix = '[Ovee.js ~ test]';
			const logger = new Logger('test');
			const message = 'some message';
			const firstObj = {};
			const secondObj = {};

			logger.error(message);
			logger.error(firstObj);
			logger.error(firstObj, secondObj);
			logger.error();

			expect(errorSpy.console).toBeCalledTimes(4);
			expect(errorSpy.console.mock.calls[0][0]).toMatch(`${basePrefix} ${message}`);
			expect(errorSpy.console.mock.calls[1][0]).toMatch(basePrefix);
			expect(errorSpy.console.mock.calls[2][0]).toMatch(basePrefix);
			expect(errorSpy.console.mock.calls[1][1]).toBe(firstObj);
			expect(errorSpy.console.mock.calls[2][1]).toBe(firstObj);
			expect(errorSpy.console.mock.calls[2][2]).toBe(secondObj);
			expect(errorSpy.console.mock.calls[3]).toEqual([]);
		});
	});

	describe('errorSpecific', () => {
		it('allows to add more parts to prefix for console.log', () => {
			const basePrefix = 'Ovee.js ~ test';
			const logger = new Logger('test');
			const message = 'some message';
			const parts = ['a', 'b'];

			logger.errorSpecific([], message);
			logger.errorSpecific(['a'], message);
			logger.errorSpecific([...parts], message);

			expect(errorSpy.console).toBeCalledTimes(3);
			expect(errorSpy.console.mock.calls[0][0]).toMatch(`[${basePrefix}] ${message}`);
			expect(errorSpy.console.mock.calls[1][0]).toMatch(`[${basePrefix} ~ a] ${message}`);
			expect(errorSpy.console.mock.calls[2][0]).toMatch(`[${basePrefix} ~ a ~ b] ${message}`);
		});
	});
});
