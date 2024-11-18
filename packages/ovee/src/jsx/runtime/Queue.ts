export class Queue<D = any> {
	protected items = new Array<D>();
	protected startIndex = 0;
	protected endIndex = 0;

	get length() {
		return this.endIndex - this.startIndex;
	}

	get isEmpty() {
		return this.length === 0;
	}

	get(index: number): D | undefined {
		if (this.length === 0) return;

		const realIndex = this.startIndex + index;

		if (realIndex < this.startIndex || realIndex >= this.endIndex) return;

		return this.items[index + this.startIndex];
	}

	push(item: D) {
		this.items[this.endIndex] = item;
		this.endIndex++;
	}

	pop(): D | undefined {
		const item = this.items[this.startIndex];

		if (!item) return;

		this.items.splice(this.startIndex, 1);
		this.startIndex++;

		if (this.startIndex === this.endIndex) {
			this.resetQueue();
		}

		return item;
	}

	first(): D | undefined {
		return this.items[this.startIndex];
	}

	last(): D | undefined {
		return this.items[this.endIndex - 1];
	}

	list(): D[] {
		return this.items.slice(this.startIndex, this.endIndex);
	}

	resetQueue() {
		this.startIndex = 0;
		this.endIndex = 0;
		this.items = [];
	}

	*[Symbol.iterator]() {
		for (let i = this.startIndex; i < this.endIndex; i++) {
			yield this.items[i];
		}
	}
}
