import { JSX_FRAGMENT, JSX_TEXT_FIBER } from './createFiber';
import { ElementFiber, ElementFiberProps, Fiber, FunctionFiber } from './types';
import { areFibersSame, isAtrribute, isEvent, isFunctionFiber, isGone, isNew } from './utils';

export type Process = (fiber: Fiber, target?: Node | null) => void;

export type Render = (fiber: Fiber, target?: Node | null) => Promise<void>;
export type RenderSync = () => void;

export class Renderer {
	currentRoot: ElementFiber | null = null;
	wipRoot: ElementFiber | null = null;
	toDelete: Fiber[] = [];

	/**
	 * process fiber tree, compare with the old one and prepare for render
	 */
	process(fiber: Fiber, target?: Node | null) {
		if (!target) return;

		this.wipRoot = {
			type: 'ROOT',
			node: target,
			alternate: this.currentRoot,
			props: {
				children: [fiber],
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

		if (fiber.child) {
			return fiber.child;
		}

		let nextFiber: Fiber | undefined = fiber;
		while (nextFiber) {
			// setup siblings
			if (nextFiber.sibling) {
				return nextFiber.sibling;
			}

			// do a siblings look up, till a root fiber will be found with no parent
			// meaning the end of units to work on
			nextFiber = nextFiber.parent;
		}

		return null;
	}

	render() {
		this.toDelete.forEach(commitWork);
		commitWork(this.wipRoot?.child);

		this.currentRoot = this.wipRoot;
		this.wipRoot = null;
	}
}

function getFunctionFiberChildren(fiber: FunctionFiber): Fiber[] {
	return [fiber.type(fiber.props, fiber)];
}

function updateFiberNode(fiber: Fiber) {
	if (isFunctionFiber(fiber) || fiber.type === JSX_FRAGMENT) return;

	if (!fiber.node) {
		fiber.node = createNode(fiber);
	}
}

function createNode(fiber: ElementFiber): Node | undefined {
	const node =
		fiber.type === JSX_TEXT_FIBER
			? document.createTextNode(fiber.props?.nodeValue ?? '')
			: document.createElement(fiber.type);

	if (!(node instanceof Text)) {
		updateNode(node, fiber);
	}

	return node;
}

function reconcileChildren(toDelete: Fiber[], fiber: Fiber, children?: Fiber[]) {
	if (!children) return;

	let oldChild = fiber.alternate?.child;
	let prevSibling: Fiber;

	// connect child fibers with it's parent and siblings
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const sameType = areFibersSame(child, oldChild);

		if (sameType) {
			if (child.key) console.log('>> update');
			child.node = oldChild?.node;
			child.parent = fiber;
			child.alternate = oldChild;
			child.effectTag = 'UPDATE';
		}

		if (child && !sameType) {
			if (child.key) console.log('>> place', child);
			child.parent = fiber;
			child.effectTag = 'PLACEMENT';
		}

		if (oldChild && !sameType) {
			if (oldChild.key) console.log('>> delete', oldChild);
			oldChild.effectTag = 'DELETION';
			toDelete.push(oldChild);
		}

		if (oldChild) {
			oldChild = oldChild.sibling;
		}

		if (i === 0) {
			fiber.child = child;
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			prevSibling!.sibling = child;
		}

		prevSibling = child;
	}
}

function commitWork(fiber?: Fiber | null) {
	if (!fiber) return;

	let parentFiber = fiber.parent;

	while (!parentFiber?.node) {
		parentFiber = parentFiber?.parent;
	}

	const nodeParent = parentFiber.node;

	if (nodeParent) {
		if (fiber.effectTag === 'DELETION') {
			console.log('[jsx] delete', fiber);
			commitDeletion(fiber, nodeParent);
		} else if (fiber.effectTag === 'PLACEMENT') {
			console.log('[jsx] placement', fiber);
			placeNode(fiber, nodeParent);
		} else {
			updateNode(fiber.node, fiber);
		}
	} else {
		if (fiber.type === JSX_FRAGMENT) {
			console.error('Fragment was used without an existing parent.');
		} else {
			console.error('Unprocessed fiber was passed. Aborting');
		}
	}

	commitWork(fiber.child);
	commitWork(fiber.sibling);
}

function commitDeletion(fiber: Fiber, nodeParent: Node) {
	if (fiber.node) {
		nodeParent.removeChild(fiber.node);
	} else if (fiber.child) {
		commitDeletion(fiber.child, nodeParent);
	}
}

function placeNode(_fiber: Fiber, nodeParent: Node) {
	if (!_fiber.node) return;
	if (!_fiber.sibling) {
		return nodeParent.appendChild(_fiber.node);
	}

	nodeParent.appendChild(_fiber.node);
}

// function findPreviousNode() {
// 	let currentFiber: Fiber | undefined = fiber;
// 	let outputNode = currentFiber?.node;

// 	while (!outputNode && currentFiber) {
// 		if (currentFiber.child) {
// 			outputNode = deepSearchNode(currentFiber.child);
// 		}

// 		currentFiber = currentFiber.sibling;
// 	}

// 	return outputNode;
// }

// function findSiblingNode(fiber: Fiber) {
// 	let currentFiber = fiber.sibling;
// 	let outputNode = currentFiber?.node;

// 	while (!outputNode && currentFiber) {
// 		if (currentFiber.child) {
// 			outputNode = deepSearchNode(currentFiber.child)
// 		}

// 		currentFiber = currentFiber.sibling;
// 	}

// 	return outputNode;
// }

// function deepSearchNode(fiber: Fiber) {
// 	let currentFiber: Fiber | undefined = fiber;
// 	let outputNode = currentFiber?.node;

// 	while (!outputNode && currentFiber) {
// 		if (currentFiber.child) {
// 			outputNode = deepSearchNode(currentFiber.child);
// 		}

// 		currentFiber = currentFiber.sibling;
// 	}

// 	return outputNode;
// }

function updateNode(_node: Node | undefined, _fiber: Fiber) {
	// NOTE: maybe handle
	if (!_node) return;

	const fiber = _fiber as ElementFiber;
	const node = <Element>_node;
	const nextProps = fiber.props;
	const prevProps = fiber.alternate?.props ?? {};
	const shouldConsole = !!nextProps.class;

	if (shouldConsole) {
		console.log('update node', { ...nextProps }, { ...prevProps });
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
		.filter(isGone(nextProps))
		.forEach(name => {
			if (shouldConsole) console.log('remove: ', name);

			if (name === 'style' || name === 'class') {
				node.removeAttribute(name);
			} else {
				(node as any)[name] = '';
			}
		});

	// Set new or changed properties
	Object.keys(nextProps)
		.filter(isAtrribute)
		.filter(isNew(prevProps, nextProps))
		.forEach(name => {
			if (shouldConsole) console.log('set: ', name);

			if (name === 'style' || name === 'class') {
				node.setAttribute(name, nextProps[name]);
			} else {
				(node as any)[name] = nextProps[name];
			}
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
