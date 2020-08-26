type CallbackKeys = 'addedNodes' | 'removedNodes'

export interface MutationCallback {
    (list: NodeList): void
}

const defaultObserverConfig = {
    childList: true,
    subtree: true
};

function filterCallback(mutation: MutationRecord, key: CallbackKeys, callback: MutationCallback) {
    if (mutation.type === 'childList' && mutation[key].length > 0) {
        callback(mutation[key]);
    }
}

function attachMutationObserver(
    root: Node, onAddedCallback: MutationCallback, onRemovedCallback: MutationCallback
): MutationObserver {
    const DOMObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            filterCallback(mutation, 'addedNodes', onAddedCallback);
            filterCallback(mutation, 'removedNodes', onRemovedCallback);
        });
    });

    DOMObserver.observe(root, defaultObserverConfig);

    return DOMObserver;
}

export default attachMutationObserver;
