/* eslint-disable max-classes-per-file */
import { JSDOM } from 'jsdom';
import { html, render } from 'lit-html';
import App from 'src/core/App';
import Component from 'src/core/Component';
import TemplateComponent from 'src/core/TemplateComponent';
import EventDelegate from 'src/dom/EventDelegate';
import attachMutationObserver from 'src/utils/attachMutationObserver';

jest.mock('../../../src/core/App');
jest.mock('../../../src/dom/EventDelegate');
jest.mock('../../../src/utils/attachMutationObserver');
jest.mock('lit-html', () => ({
	__esModule: true,
	html: jest.fn().mockImplementation(String.raw),
	render: jest.fn()
}));

const dom = new JSDOM('<!DOCTYPE html>');

describe('TemplateComponent class', () => {
	let _orgMutationObserver: typeof MutationObserver;

	beforeAll(() => {
		_orgMutationObserver = window.MutationObserver;
		window.MutationObserver = jest.fn();
		(window.MutationObserver as jest.Mock).mockImplementation(() => ({
			disconnect: jest.fn(),
			observe: jest.fn()
		}));

		(EventDelegate as jest.Mock).mockImplementation(() => ({
			on: jest.fn(),
			off: jest.fn(),
			emit: jest.fn(),
			destroy: jest.fn()
		}));

		(attachMutationObserver as jest.Mock).mockImplementation(() => ({
			observe: jest.fn(),
			disconnect: jest.fn(),
			takeRecords: jest.fn()
		}));
	});

	afterAll(() => {
		window.MutationObserver = _orgMutationObserver;
	});

	beforeEach(() => {
		(App as jest.Mock).mockClear();
		(EventDelegate as jest.Mock).mockClear();
		(attachMutationObserver as jest.Mock).mockClear();
	});

	it('should extend Component', () => {
		const element = dom.window.document.createElement('div');
		const app = new App();
		const options = {};

		const component = new TemplateComponent(element, app, options);

		expect(component).toBeInstanceOf(Component);
	});

	it('should expose html property', () => {
		const element = dom.window.document.createElement('div');
		const app = new App();
		const options = {};

		const component = new TemplateComponent(element, app, options);

		expect(component.html).toBe(html);
	});

	it('should render as soon as initialized', async () => {
		await asyncHelper(async calls => {
			const element = dom.window.document.createElement('div');
			const app = new App();
			const options = {};

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const component = new TemplateComponent(element, app, options);

			await calls();

			expect(render).toBeCalledTimes(1);
		});
	});

	it('should call lit-html render when update is requested', async () => {
		await asyncHelper(async calls => {
			const element = dom.window.document.createElement('div');
			const app = new App();
			const options = {};
			const templateString = '<div>Lorem ipsum dolor</div>';

			const component = new (class extends TemplateComponent {
				template() {
					return templateString;
				}
			})(element, app, options);

			await calls();
			component.$requestUpdate();

			// eslint-disable-next-line no-console
			expect(render).toBeCalledTimes(2);
			expect((render as jest.Mock).mock.calls[1][0]).toBe(templateString);
		});
	});

	it('should try to rerender only if no rerender is pending', async () => {
		await asyncHelper(async calls => {
			const element = dom.window.document.createElement('div');
			const app = new App();
			const options = {};
			const component = new TemplateComponent(element, app, options);

			await calls();

			component.$requestUpdate();
			component.$requestUpdate();

			expect(requestAnimationFrame).toBeCalledTimes(1);
		});
	});

	it('should render empty template by default', () => {
		const element = dom.window.document.createElement('div');
		const app = new App();
		const options = {};

		const component = new TemplateComponent(element, app, options);

		expect(component.template()).toBe('');
	});
});
