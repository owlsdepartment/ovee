import { Logger } from '@/errors';
import { isNil } from '@/utils';

import { JSX_FRAGMENT, JSX_TEXT_FIBER } from './createFiber';
import { ElementFiber, Fiber, FunctionFiber } from './types';
import { areFibersSame, isAtrribute, isEvent, isFunctionFiber, isGone, isNew } from './utils';

export type Process = (fiber: Fiber, target?: Node | null) => void;

export type Render = (fiber: Fiber, target?: Node | null) => Promise<void>;
export type RenderSync = () => void;

const logger = new Logger('JSX Renderer');

export class Renderer {
	currentRoot: ElementFiber | null = null;
	wipRoot: ElementFiber | null = null;
	toDelete: Fiber[] = [];

	/**
	 * process fiber tree, compare with the old one and prepare for render
	 */
	process(fiber: Fiber | null | undefined, target: Node) {
		if (!target) return;

		this.wipRoot = {
			type: 'ROOT',
			node: target,
			alternate: this.currentRoot,
			props: {
				children: fiber ? [fiber] : [],
			},
		};
		this.toDelete = [];

		let nextUnit: Fiber | null = this.wipRoot;

		while (nextUnit) {
			nextUnit = this.processFiber(nextUnit);
		}
	}

	/**
	 * @returns returns next fiber to process or null to finish
	 */
	private processFiber(fiber: Fiber): Fiber | null {
		const children = isFunctionFiber(fiber)
			? getFunctionFiberChildren(fiber)
			: fiber.props.children;

		updateFiberNode(fiber);
		reconcileChildren(this.toDelete, fiber, children);

		if (fiber.firstChild) {
			return fiber.firstChild;
		}

		let nextFiber: Fiber | undefined = fiber;
		while (nextFiber) {
			// setup siblings
			if (nextFiber.nextSibling) {
				return nextFiber.nextSibling;
			}

			// do a siblings look up, till a root fiber will be found with no parent
			// meaning the end of units to work on
			nextFiber = nextFiber.parent;
		}

		return null;
	}

	render() {
		if (!this.wipRoot) return;

		this.toDelete.forEach(f => commitDeletion(f));
		this.connectNodes(this.wipRoot.node!, this.wipRoot.firstChild);
		this.wipRoot.prevSiblingNode = this.wipRoot.node!.lastChild;
		this.commitWork(this.wipRoot.firstChild);

		this.currentRoot = this.wipRoot;
		this.wipRoot = null;
	}

	private connectNodes(parentNode: Node, fiber?: Fiber): null | Fiber | Fiber[] {
		if (!fiber) return null;

		fiber.parentNode = parentNode;

		const childNodeFibers: Array<Fiber | Fiber[]> = [];

		forEachChildFiber(fiber, child => {
			const nodes = this.connectNodes(fiber.node || parentNode, child);

			if (nodes) childNodeFibers.push(nodes);
		});

		childNodeFibers.forEach((element, i) => {
			const nextElement = childNodeFibers[i + 1];
			const currentFiber = Array.isArray(element) ? element[element.length - 1] : element;
			const nextFiber: Fiber | undefined = Array.isArray(nextElement)
				? nextElement[0]
				: nextElement;

			if (!nextFiber) return;

			currentFiber.nextSiblingNode = nextFiber.node;
			nextFiber.prevSiblingNode = currentFiber.node;
		});

		if (fiber.node) return fiber;

		return childNodeFibers.length ? childNodeFibers.flat() : null;
	}

	private commitWork(fiber?: Fiber | null) {
		if (!fiber) return;

		const { parentNode } = fiber;

		if (parentNode) {
			if (fiber.effectTag === 'PLACEMENT') {
				placeNode(fiber, parentNode);
			} else if (fiber.effectTag === 'UPDATE') {
				updateNode(fiber.node, fiber);
			} else {
				logger.error('Node to delete appeared in a tree with a work to commit');
			}
		} else {
			if (fiber.type === JSX_FRAGMENT) {
				logger.error('Fragment was used without an existing parent.');
			} else {
				logger.error('Unprocessed fiber was passed. Aborting');
			}
		}

		this.commitWork(fiber.firstChild);
		this.commitWork(fiber.nextSibling);
	}
}

function getFunctionFiberChildren(fiber: FunctionFiber): Fiber[] {
	return [fiber.type(fiber.props, fiber)];
}

function updateFiberNode(fiber: Fiber) {
	if (isFunctionFiber(fiber) || fiber.type === JSX_FRAGMENT) return;

	if (!fiber.node) {
		fiber.node = createNode(fiber);
	} else {
		updateNode(fiber.node, fiber);
	}
}

function createNode(fiber: ElementFiber): Node | undefined {
	const node =
		fiber.type === JSX_TEXT_FIBER
			? document.createTextNode(fiber.props?.nodeValue ?? '')
			: document.createElement(fiber.type);

	updateNode(node, fiber);

	return node;
}

function reconcileChildren(toDelete: Fiber[], fiber: Fiber, children?: Fiber[]) {
	const removeFiber = (f: Fiber) => {
		f.effectTag = 'DELETION';
		toDelete.push(f);
	};
	const updateFiber = (child: Fiber, alternate: Fiber) => {
		child.node = alternate?.node;
		child.parent = fiber;
		child.alternate = alternate;
		child.effectTag = 'UPDATE';
	};
	const removeOldFibers = (toRemove: Fiber[]) => {
		for (let i = 0; i < toRemove.length - 1; i++) {
			removeFiber(toRemove[i]);
		}
	};

	const oldKeyChildren: Fiber[] = [];
	const oldChildren: Fiber[] = [];
	let curr = fiber.alternate?.firstChild;

	while (curr) {
		(curr.key ? oldKeyChildren : oldChildren).push(curr);
		curr = curr.nextSibling;
	}

	// remove all old children
	if (!children?.length) {
		oldChildren.forEach(removeFiber);
		oldKeyChildren.forEach(removeFiber);

		return;
	}

	for (let i = 0; i < children.length && oldKeyChildren.length > 0; i++) {
		const child = children[i];

		if (!child.key) continue;

		const idx = oldKeyChildren.findIndex(f => areFibersSame(f, child));
		const alternate = oldKeyChildren[idx];

		if (!alternate) continue;

		removeOldFibers(oldKeyChildren.splice(0, idx + 1));
		updateFiber(child, alternate);
	}

	oldKeyChildren.forEach(removeFiber);

	let prevSibling: Fiber;
	// connect child fibers with it's parent and siblings
	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		// it's not a child with key and don't have an already connected alternate fiber
		if (!child.alternate) {
			const oldChildIdx = oldChildren.findIndex(f => areFibersSame(f, child));
			const oldChild = oldChildren[oldChildIdx];

			if (!oldChild) {
				child.parent = fiber;
				child.effectTag = 'PLACEMENT';
			} else {
				removeOldFibers(oldChildren.splice(0, oldChildIdx + 1));
				updateFiber(child, oldChild);
			}
		}

		if (i === 0) {
			fiber.firstChild = child;
		} else {
			prevSibling!.nextSibling = child;
		}

		if (i === children.length - 1) {
			fiber.lastChild = child;
		}

		prevSibling = child;
	}

	oldChildren.forEach(removeFiber);
}

function commitDeletion(fiber?: Fiber) {
	if (!fiber || !fiber.parentNode) return;

	const { parentNode } = fiber;

	if (fiber.node) {
		try {
			parentNode.removeChild(fiber.node);
		} catch (e) {
			logger.error('There was a problem while removing node', fiber.node, e);
		}
	} else {
		forEachChildFiber(fiber, child => commitDeletion(child));
	}
}

function placeNode(fiber: Fiber, nodeParent: Node) {
	const toInsert = fiber.node;

	if (!toInsert) return;
	if (!fiber.prevSiblingNode) return nodeParent.insertBefore(toInsert, nodeParent.firstChild);
	if (!fiber.nextSiblingNode) return nodeParent.appendChild(toInsert);

	nodeParent.insertBefore(toInsert, fiber.prevSiblingNode?.nextSibling || null);
}

function updateNode(_node: Node | undefined, fiber: Fiber) {
	if (!_node) return;

	const node = <Element>_node;
	const nextProps = fiber.props;
	const prevProps = fiber.alternate?.props ?? {};

	if (node instanceof Text) {
		node.nodeValue = nextProps.nodeValue;
		return;
	}

	//Remove old or changed event listeners
	Object.keys(prevProps)
		.filter(isEvent)
		.filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
		.forEach(name => {
			const eventType = name.toLowerCase().substring(2);

			node.removeEventListener(eventType, prevProps[name]);
		});

	// Remove old properties
	Object.keys(prevProps)
		.filter(isAtrribute)
		.filter(isGone(prevProps, nextProps))
		.forEach(name => {
			node.removeAttribute(name);
		});

	// Set new or changed properties
	Object.keys(nextProps)
		.filter(isAtrribute)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			// TODO: handle boolean attributes
			let value = nextProps[name];

			if (value === true) value = '';
			if (isNil(value)) return;

			node.setAttribute(name, value);
		});

	// Add event listeners
	Object.keys(nextProps)
		.filter(v => {
			return isEvent(v);
		})
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			// NOTE: in feature: handle modifiers here
			const eventType = name.toLowerCase().substring(2);

			node.addEventListener(eventType, nextProps[name]);
		});
}

function forEachChildFiber(fiber: Fiber | null | undefined, cb: (fiber: Fiber) => void) {
	let currentFiber = fiber?.firstChild;

	while (currentFiber) {
		cb(currentFiber);

		currentFiber = currentFiber.nextSibling;
	}
}
