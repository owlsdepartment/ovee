/* eslint-disable max-classes-per-file */
import { html, render } from 'lit-html';
import App from 'src/core/App';
import Component from 'src/core/Component';
import TemplateComponent from 'src/core/TemplateComponent';
import { createComponent } from 'tests/helpers';

jest.mock('lit-html', () => ({
	__esModule: true,
	html: jest.fn().mockImplementation(String.raw),
	render: jest.fn(),
}));

describe('TemplateComponent class', () => {
	beforeEach(async () => {
		await waitForFrame();
		(html as jest.Mock).mockClear();
		(render as jest.Mock).mockClear();
	});

	it('should extend Component', () => {
		const element = document.createElement('div');
		const app = new App();
		const options = {};

		const component = new TemplateComponent(element, app, options);

		expect(component).toBeInstanceOf(Component);
	});

	it('should expose html property', () => {
		const element = document.createElement('div');
		const app = new App();
		const options = {};

		const component = new TemplateComponent(element, app, options);

		expect(component.html).toBe(html);
	});

	it('should render as soon as initialized', async () => {
		const element = document.createElement('div');
		const app = new App();
		const options = {};

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const component = new TemplateComponent(element, app, options);

		await flushPromises();
		await waitForFrame();

		expect(render).toBeCalledTimes(1);
	});

	it('should call lit-html render when update is requested', async () => {
		const element = document.createElement('div');
		const app = new App();
		const options = {};
		const templateString = '<div>Lorem ipsum dolor</div>';

		const component = new (class extends TemplateComponent {
			template() {
				return templateString;
			}
		})(element, app, options);

		await flushPromises();
		await waitForFrame();
		await component.$requestUpdate();

		expect(render).toBeCalledTimes(2);
		expect((render as jest.Mock).mock.calls[1][0]).toBe(templateString);
	});

	it('should try to rerender only if no rerender is pending', async () => {
		const element = document.createElement('div');
		const app = new App();
		const options = {};
		const component = new TemplateComponent(element, app, options);

		await flushPromises();
		await waitForFrame();

		component.$requestUpdate();
		await component.$requestUpdate();
		await waitForFrame();

		expect(render).toBeCalledTimes(2);
	});

	it('should render empty template by default', () => {
		const element = document.createElement('div');
		const app = new App();
		const options = {};

		const component = new TemplateComponent(element, app, options);

		expect(component.template()).toBe('');
	});

	it('stopsRerenderWatch on destroy', () => {
		const test = createComponent(TemplateComponent);
		const stopWatchSpy = jest.spyOn(test, 'stopWatch' as any);

		test.$destroy();

		expect(stopWatchSpy).toBeCalledTimes(1);
	});
});
