export function isValidNode(node: Node): node is HTMLElement {
	const { nodeName, nodeType } = node;

	return nodeName !== 'svg' && nodeType === 1 && node instanceof HTMLElement;
}
