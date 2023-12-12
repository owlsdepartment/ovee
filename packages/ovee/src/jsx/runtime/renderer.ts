import { TEXT_FIBER } from './createFiber';
import { ElementFiber, Fiber, FiberProps, FunctionFiber } from './types';
import { isAtrribute, isEvent, isFunctionFiber, isGone, isNew } from './utils';

export type Render = (fiber: Fiber, target?: Node | null) => Promise<void>;
export type RenderSync = (fiber: Fiber, target?: Node | null) => void;

export function createRenderer(): { renderSync: RenderSync } {
	let currentRoot: Fiber | null = null;
	let wipRoot: Fiber | null = null;
	let toDelete: Fiber[] = [];

	// async function render(fiber: Fiber, target?: Node | null) {
	// 	if (!target) return;

	// 	wipRoot = {
	// 		type: 'ROOT',
	// 		node: target,
	// 		alternate: currentRoot,
	// 		props: {
	// 			children: [fiber],
	// 		},
	// 	};
	// 	toDelete = [];

	// 	await scheduleJob(wipRoot, processFiber);

	// 	console.log('after schedule...');
	// 	commitRoot();
	// }

	async function renderSync(fiber: Fiber, target?: Node | null) {
		if (!target) return;

		wipRoot = {
			type: 'ROOT',
			node: target,
			alternate: currentRoot,
			props: {
				children: [fiber],
			},
		};
		toDelete = [];

		let nextUnit: Fiber | null = wipRoot;

		while (nextUnit) {
			nextUnit = processFiber(nextUnit);
		}

		commitRoot();
	}

	/**
	 * @returns returns next fiber to process or null to finish
	 */
	function processFiber(fiber: Fiber): Fiber | null {
		const children = isFunctionFiber(fiber)
			? updateFunctionFiber(fiber)
			: updateElementFiber(fiber);

		reconcileChildren(toDelete, fiber, children);

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

	function commitRoot() {
		toDelete.forEach(commitWork);
		commitWork(wipRoot?.child);

		currentRoot = wipRoot;
		wipRoot = null;
	}

	return {
		// render,
		renderSync,
	};
}

function updateFunctionFiber(fiber: FunctionFiber): Fiber[] | undefined {
	return [fiber.type(fiber.props)];
}

function updateElementFiber(fiber: ElementFiber): Fiber[] | undefined {
	if (!fiber.node) {
		fiber.node = createNode(fiber);
	}

	return fiber.props.children;
}

function createNode(fiber: ElementFiber): Node | undefined {
	const node =
		fiber.type === TEXT_FIBER
			? document.createTextNode(fiber.props?.nodeValue ?? '')
			: document.createElement(fiber.type);

	if (!(node instanceof Text)) {
		updateNode(node, fiber.props);
	}

	return node;
}

function reconcileChildren(toDelete: Fiber[], fiber: Fiber, children?: Fiber[]) {
	// NOTE: future feature: use keys
	if (!children) return;

	let oldChild = fiber.alternate?.child;
	let prevSibling: Fiber;

	// connect child fibers with it's parent and siblings
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const sameType = oldChild && child && oldChild.type === child.type;

		if (sameType) {
			child.node = oldChild?.node;
			child.parent = fiber;
			child.alternate = oldChild;
			child.effectTag = 'UPDATE';
		}

		if (child && !sameType) {
			child.parent = fiber;
			child.effectTag = 'PLACEMENT';
		}

		if (oldChild && !sameType) {
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

	let nodeParentFiber = fiber.parent;
	while (!nodeParentFiber?.node) {
		nodeParentFiber = nodeParentFiber?.parent;
	}

	const nodeParent = nodeParentFiber.node;

	if (nodeParent) {
		if (fiber.effectTag === 'PLACEMENT' && fiber.node) {
			nodeParent.appendChild(fiber.node);
		} else if (fiber.effectTag === 'DELETION') {
			commitDeletion(fiber, nodeParent);
		} else if (fiber.effectTag === 'UPDATE' && fiber.node) {
			updateNode(fiber.node, fiber.props, fiber.alternate?.props);
		}
	} else {
		console.error('Unprocessed fiber was passed. Aborting');
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

function updateNode(_node: Node, nextProps: FiberProps, prevProps: FiberProps = {}) {
	const node = _node as Element;
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
