export function isValidNode(node: Node): node is HTMLElement {
	const { nodeName, nodeType } = node;

	return nodeType === 1 && node instanceof HTMLElement && nodeName.toLowerCase() !== 'script';
}
