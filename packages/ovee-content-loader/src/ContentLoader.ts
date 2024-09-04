import barba from '@barba/core';
import { defineModule } from 'ovee.js';

import { ResolverClass } from './Resolver';

export const DEFAULT_TIMEOUT = 20000;

export interface ContentLoaderOptions {
	resolvers: Record<string, ResolverClass>;
	timeout?: number;
}

const { request } = barba;

export interface ContentLoaderReturn {
	loadPage: (
		url: string,
		resolverName: string,
		target?: Element | null,
		pushState?: boolean
	) => Promise<void>;
}

export const ContentLoader = defineModule<ContentLoaderOptions, ContentLoaderReturn>(
	({ app, options }) => {
		const timeout = options.timeout ?? DEFAULT_TIMEOUT;
		const resolvers: Record<string, ResolverClass> = options.resolvers;

		function getResolver(name: string): ResolverClass | false {
			if (resolvers[name] === undefined) {
				console.error(`[ovee.js/ContentLoader] Resolver not registered for key ${name}`);

				return false;
			}

			return resolvers[name];
		}

		async function loadPage(
			url: string,
			resolverName: string,
			target: Element | null = null,
			pushState = true
		): Promise<void> {
			const ResolverCtor = getResolver(resolverName);

			if (!ResolverCtor) {
				return;
			}

			const resolver = new ResolverCtor(app, target, url, pushState);
			const requestPage = request(url, timeout, (reqUrl, reqErr) => {
				console.error(`[ovee.js/ContentLoader] Error while requesting ${reqUrl}`, reqErr);

				return false;
			});

			await resolver.contentOut();

			let content: string | null = null;

			try {
				content = await requestPage;
			} catch {
				resolver.handleError();
			}

			if (!content) {
				return;
			}

			const parser = new DOMParser();
			const doc = parser.parseFromString(content, 'text/html');

			if (resolver.pushState && resolver.shouldPushState) {
				resolver.updateHistory(doc.title, url);
			}

			await resolver.updateContent(doc);
			await resolver.contentIn();
		}

		return {
			loadPage,
		};
	}
);
