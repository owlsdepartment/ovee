export function attachAttributeObserver(
	attributeKey: string,
	onAttributeUpdate: (entry: MutationRecord) => void
) {
	const observer = new MutationObserver(entries => {
		entries.forEach(entry => {
			const { type, attributeName } = entry;

			if (type !== 'attributes' || attributeName !== attributeKey) return;

			onAttributeUpdate(entry);
		});
	});

	return {
		observer,

		observe: (target: HTMLElement) => {
			observer.observe(target, { attributes: true, attributeFilter: [attributeKey] });
		},

		disconnect: () => observer.disconnect(),
	};
}
