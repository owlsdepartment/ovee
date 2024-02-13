import type { App } from '../app';

export interface TemplateContext {
	app: App;
}

let templateContext: TemplateContext | null = null;

export function injectTemplateContext() {
	return templateContext;
}

export function executeWithTemplateContext(ctx: TemplateContext, cb: () => void) {
	const oldContext = templateContext;
	templateContext = ctx;

	cb();

	templateContext = oldContext;
}
