import { Logger } from '@/errors';

const logger = new Logger('useTemplate');

// NOTE: may be built in useTemplate, for now it's seperate

// class WithSlots extends Ctor {
// 	slots = {} as Record<string, Node[]>;

// 	[protectedFields.BEFORE_INIT]() {
// 		this.initSlots();
// 		super[protectedFields.BEFORE_INIT]();
// 	}

// 	initSlots() {
// 		for (const node of Array.from(this.$element.childNodes)) {
// 			// fallback to `slot-name` for template elements
// 			const slotName =
// 				(node instanceof Element &&
// 					(node.getAttribute('slot') || node.getAttribute('slot-name'))) ||
// 				DEFAULT_SLOT_NAME;

// 			if (node instanceof HTMLTemplateElement) {
// 				node.content.childNodes.forEach(node => this.addToSlot(slotName, node));
// 			} else {
// 				this.addToSlot(slotName, node);
// 			}
// 		}
// 	}

// 	private addToSlot(name: string, node: Node) {
// 		if (!this.slots[name]) {
// 			this.slots[name] = [];
// 		}

// 		this.slots[name].push(node);
// 	}

// 	slot(name = 'default', clone = true) {
// 		const slotContent = this.slots[name] ?? [];

// 		if (!clone)
// 			return html`
// 				${slotContent}
// 			`;

// 		const duplicate = slotContent.map(n => n.cloneNode(true));

// 		return html`
// 			${duplicate}
// 		`;
// 	}
// }

export function useSlots() {
	// How it works?
	/**
	 * - save slots from `innerHTML`
	 * - save slots from outside, when used inside JSX template
	 * - expose them via returned helper function
	 */
}
