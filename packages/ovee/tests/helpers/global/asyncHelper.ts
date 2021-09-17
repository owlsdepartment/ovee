export async function asyncHelper(
	runFn: (calls: () => Promise<any[]>, wipe: () => void) => Promise<any>
) {
	const orgSetTimeout = window.setTimeout;
	const orgRequestAnimationFrame = window.requestAnimationFrame;
	const asyncFn: ((...args: any[]) => Promise<any>)[] = [];
	const getStubFn: any = () =>
		jest.fn(
			// eslint-disable-next-line @typescript-eslint/ban-types
			(c: Function) => asyncFn.push(c())
		);

	window.setTimeout = getStubFn();
	window.requestAnimationFrame = getStubFn();

	const result = await runFn(
		() => Promise.all(asyncFn),
		() => {
			asyncFn.splice(0, asyncFn.length);
		}
	);

	window.setTimeout = orgSetTimeout;
	window.requestAnimationFrame = orgRequestAnimationFrame;

	return result;
}
