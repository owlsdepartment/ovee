import { AppConfigurator } from './AppConfigurator';

export interface AppConfig {
	namespace: string;
	productionTip: boolean;
	document: Document;
}

export const defaultConfig: AppConfig = {
	namespace: 'ovee',
	productionTip: process.env.NODE_ENV !== 'production',
	document,
};

export function createApp(config: Partial<AppConfig> = {}) {
	return new AppConfigurator({
		...defaultConfig,
		...config,
	});
}
