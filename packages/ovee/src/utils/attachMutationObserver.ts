type CallbackKeys = 'addedNodes' | 'removedNodes';

export interface MutationCallback {
	(list: Node[]): void;
}

export const defaultObserverConfig = {
	childList: true,
	subtree: true,
};

function filterCallback(mutation: MutationRecord, key: CallbackKeys, callback: MutationCallback) {
	if (mutation.type === 'childList' && mutation[key].length > 0) {
		callback(Array.from(mutation[key]));
	}
}

/**
 * Moved nodes can come as removed, but they can be distinquished by checking if they have parent
 */
export function attachMutationObserver(
	root: Node,
	onAddedCallback: MutationCallback,
	onRemovedCallback: MutationCallback
): { observer: MutationObserver; run: () => void } {
	const DOMObserver = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			filterCallback(mutation, 'addedNodes', onAddedCallback);
			filterCallback(mutation, 'removedNodes', onRemovedCallback);
		});
	});
	const run = () => {
		DOMObserver.observe(root, defaultObserverConfig);
	};

	run();

	return {
		observer: DOMObserver,
		run,
	};
}
