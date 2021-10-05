import { doPathWatch, doWatch, handleCombinedWatch, makeReactive, ref } from 'src/reactive';

jest.mock('src/reactive/watch/doPathWatch');
jest.mock('src/reactive/watch/vue', () => {
	const originalModule = jest.requireActual('src/reactive/watch/vue');

	return {
		__esModule: true,
		...originalModule,
		doWatch: jest.fn(originalModule.doWatch),
	};
});

const mockedDoWatch = doWatch as jest.Mock;
const mockedDoPathWatch = doPathWatch as jest.Mock;

describe('handleCombinedWatch', () => {
	it(`uses 'doPathWatch' if source argument is string`, () => {
		const target = makeReactive({ a: 'a' });
		const source = 'a';
		const cb = () => {};
		const options = {};

		handleCombinedWatch(target, source, cb, options);

		expect(mockedDoPathWatch).toBeCalledTimes(1);
		expect(mockedDoPathWatch).toBeCalledWith(target, source, cb, options);
	});

	it(`uses 'doWatch' if source argument is ref, function or array`, () => {
		const target = makeReactive({ a: 'b' });
		const sources = [ref(false), () => target.a, []];
		const cb = () => {};
		const options = {};

		for (const source of sources) {
			handleCombinedWatch(target, source, cb, options);
		}

		expect(mockedDoWatch).toBeCalledTimes(sources.length);
		for (let i = 0; i < sources.length; i++) {
			expect(mockedDoWatch).toBeCalledWith(sources[i], cb, options);
		}
	});
});
