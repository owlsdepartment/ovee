type CallbackKeys = 'addedNodes' | 'removedNodes';

export interface MutationCallback {
	(list: Node[]): void;
}

const defaultObserverConfig = {
	childList: true,
	subtree: true
};

function filterCallback(mutation: MutationRecord, key: CallbackKeys, callback: MutationCallback) {
	if (mutation.type === 'childList' && mutation[key].length > 0) {
		callback(Array.from(mutation[key]));
	}
}

/**
 * Moved nodes can come as removed, but they can be distinquished by checking if they have parent
 */
function attachMutationObserver(
	root: Node,
	onAddedCallback: MutationCallback,
	onRemovedCallback: MutationCallback
): MutationObserver {
	const DOMObserver = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			filterCallback(mutation, 'addedNodes', onAddedCallback);
			filterCallback(mutation, 'removedNodes', onRemovedCallback);
		});
	});

	DOMObserver.observe(root, defaultObserverConfig);

	return DOMObserver;
}

export default attachMutationObserver;
