function isValidNode(node: Node): node is Element {
    const { nodeName, nodeType } = node;

    return nodeName !== 'SCRIPT' && nodeName !== 'svg' && nodeType === 1;
}

export default isValidNode;
