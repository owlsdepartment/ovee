export const requestIdleCallback: (typeof window)['requestIdleCallback'] =
	window.requestIdleCallback ||
	function (callback: IdleRequestCallback): number {
		return setTimeout(() => {
			callback({
				didTimeout: false,
				timeRemaining: () => 1,
			});
		}, 1) as any as number;
	};

export const cancelIdleCallback: (typeof window)['cancelIdleCallback'] =
	window.cancelIdleCallback ||
	function (handle: number) {
		clearTimeout(handle);
	};
