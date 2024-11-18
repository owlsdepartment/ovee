import { NOOP } from '@/constants';
import { ComponentInstance, injectComponentContext } from '@/core';
import { Logger } from '@/errors';
import { Fiber, JSX_FRAGMENT, JSXElement } from '@/jsx';
import { getNoContextWarning } from '@/utils';

type StoredSlot = HTMLTemplateElement | Node[];

const logger = new Logger('useSlots');
const DEFAULT_SLOT_NAME = 'default';

// NOTE: may be built in useTemplate, for now it's seperate
export type SlotFunction = (props: { name?: string }) => JSXElement;

const slotsMap = new Map<ComponentInstance, SlotFunction>();

export function useSlots(): SlotFunction {
	const instance = injectComponentContext(true);

	if (!instance) {
		logger.warn(getNoContextWarning('useSlots'));

		return NOOP as SlotFunction;
	}

	let output = slotsMap.get(instance);

	if (!output) {
		output = initializeSlots(instance);
		slotsMap.set(instance, output);
	}

	return output;
}

function initializeSlots(instance: ComponentInstance): SlotFunction {
	if (!instance.jsxSlot) {
		return initHTMLSlots(instance);
	}

	return ({ name = DEFAULT_SLOT_NAME }) => {
		const jsxSlot = instance.jsxSlot!.value;
		const isFunction = typeof jsxSlot === 'function';

		if (isFunction) {
			return name === DEFAULT_SLOT_NAME ? jsxSlot() : undefined;
		}

		return jsxSlot[name]?.();
	};
}

function initHTMLSlots(instance: ComponentInstance): SlotFunction {
	const slots = new Map<string, DocumentFragment>();
	const storedSlots = new Map<string, StoredSlot>();

	for (const node of Array.from(instance.element.childNodes)) {
		// fallback to `slot-name` for template elements
		const slotName =
			(node instanceof Element && (node.getAttribute('slot') || node.getAttribute('slot-name'))) ||
			DEFAULT_SLOT_NAME;

		const logWarning = addToSlotMap(slotName, node, storedSlots);

		if (logWarning) {
			logger.warn(
				`There are multiple slots with name ${slotName} inside `,
				instance.element,
				`. Slots should have 1 declaration per slot`
			);
		}
	}

	for (const [key, value] of storedSlots) {
		const fragment =
			value instanceof HTMLTemplateElement
				? value.content
				: value.reduce<DocumentFragment>((frag, n) => {
						frag.append(n);

						return frag;
				  }, new DocumentFragment());

		slots.set(key, fragment.cloneNode(true) as DocumentFragment);
	}

	storedSlots.clear();

	return ({ name = DEFAULT_SLOT_NAME }): Fiber => {
		const node = slots.get(name);

		return {
			type: JSX_FRAGMENT,
			node,
			props: {},
		};
	};
}

function addToSlotMap(name: string, toStore: Node, slots: Map<string, StoredSlot>): boolean {
	const hasStoredValue = slots.has(name);

	if (toStore instanceof HTMLTemplateElement) {
		const shouldLogError = hasStoredValue;

		slots.set(name, toStore);

		return shouldLogError;
	}

	if (!hasStoredValue) {
		slots.set(name, [toStore]);
	} else {
		const stored = slots.get(name)!;

		if (Array.isArray(stored)) {
			stored.push(toStore);
		} else {
			slots.set(name, [toStore]);

			return true;
		}
	}

	return false;
}
