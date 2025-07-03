import { Plugin, Widget, toWidget, Command } from 'ckeditor5';
import PlotlyRenderer from './plotlyrenderer';
import './plotlychart.css';

export default class PlotlyChartEditing extends Plugin {
	private _mutationObserver: MutationObserver | null = null;

	static get requires() {
		return [Widget];
	}

	init() {
		this._defineSchema();
		this._defineConverters();
		this._defineCommands();
	}

	afterInit() {
		this._setupChartRendering();
	}

	destroy() {
		// Clean up mutation observer
		if (this._mutationObserver) {
			this._mutationObserver.disconnect();
			this._mutationObserver = null;
		}
		
		super.destroy();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register('plotlyChart', {
			inheritAllFrom: '$blockObject',
			allowAttributes: ['chartData', 'chartType', 'chartTitle']
		});
	}

	_defineConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;

		// View to model converter
		conversion.for('upcast').elementToElement({
			view: {
				name: 'div',
				classes: 'plotly-chart'
			},
			model: (viewElement, { writer }) => {
				const chartData = viewElement.getAttribute('data-chart-data');
				const chartType = viewElement.getAttribute('data-chart-type');
				const chartTitle = viewElement.getAttribute('data-chart-title');

				return writer.createElement('plotlyChart', {
					chartData: chartData || '{}',
					chartType: chartType || 'scatter',
					chartTitle: chartTitle || 'Chart'
				});
			}
		});

		// Model to view converter for editing
		conversion.for('editingDowncast').elementToElement({
			model: 'plotlyChart',
			view: (modelElement, { writer }) => {
				console.log('🏗️ Converting model to editing view:', modelElement);
				
				const chartData = modelElement.getAttribute('chartData');
				const chartType = modelElement.getAttribute('chartType');
				const chartTitle = modelElement.getAttribute('chartTitle');

				console.log('🔍 Model attributes:', { chartData, chartType, chartTitle });

				// Create the widget wrapper
				const widgetWrapper = writer.createContainerElement('div', {
					class: 'plotly-chart-widget'
				});

				// Create the actual chart container inside the widget
				const plotlyDiv = writer.createRawElement('div', {
					class: 'plotly-chart plotly-chart-pending',
					'data-chart-data': chartData,
					'data-chart-type': chartType,
					'data-chart-title': chartTitle
				}, function(domElement) {
					// This function allows us to customize the DOM element
					// The domElement will not be managed by CKEditor's editing engine
					console.log('🔥 Raw element created for Plotly:', domElement);
				});

				// Insert the chart div into the wrapper
				writer.insert(writer.createPositionAt(widgetWrapper, 0), plotlyDiv);

				console.log('📦 Created nested structure: wrapper > chart div');

				const widgetElement = toWidget(widgetWrapper, writer, {
					label: 'Plotly chart widget'
				});

				console.log('🎯 Created widget element with nested structure');

				return widgetElement;
			}
		});

		// Model to view converter for data
		conversion.for('dataDowncast').elementToElement({
			model: 'plotlyChart',
			view: (modelElement, { writer }) => {
				const chartData = modelElement.getAttribute('chartData');
				const chartType = modelElement.getAttribute('chartType');
				const chartTitle = modelElement.getAttribute('chartTitle');

				return writer.createContainerElement('div', {
					class: 'plotly-chart',
					'data-chart-data': chartData,
					'data-chart-type': chartType,
					'data-chart-title': chartTitle
				});
			}
		});
	}

	_defineCommands() {
		const editor = this.editor;
		
		// Register the insert chart command
		editor.commands.add('insertPlotlyChart', new InsertPlotlyChartCommand(editor));
	}

	_setupChartRendering() {
		console.log('🎨 Setting up chart rendering...');
		const editor = this.editor;

		// Initial rendering - DOM should be ready in afterInit
		console.log('🔄 Initial chart rendering attempt');
		this._renderPendingCharts();
		
		// Set up mutation observer
		console.log('👁️ Setting up mutation observer');
		this._setupMutationObserver();

		// Listen for model changes (when new charts are inserted)
		editor.model.document.on('change:data', () => {
			console.log('📊 Model data changed - scheduling chart render');
			// Use setTimeout to ensure DOM is updated
			setTimeout(() => {
				this._renderPendingCharts();
			}, 100);
		});

		// Listen for when elements are added to the model
		editor.model.document.on('change', () => {
			const changes = editor.model.document.differ.getChanges();
			const hasChartChanges = changes.some(change => 
				change.type === 'insert' && 
				change.name === 'plotlyChart'
			);
			
			if (hasChartChanges) {
				console.log('📈 Chart element detected in model changes');
				setTimeout(() => {
					this._renderPendingCharts();
				}, 200);
			}
		});
	}


	_setupMutationObserver() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		
		// Get the main DOM root from the editing view
		let domRoot: Element | null = null;
		if (editingView.getDomRoot) {
			domRoot = editingView.getDomRoot() || null;
		} else {
			const viewRoot = editingView.document.getRoot();
			if (viewRoot) {
				domRoot = editingView.domConverter.viewToDom(viewRoot) as Element;
			}
		}
		
		if (!domRoot) {
			console.warn('Cannot setup mutation observer: DOM root not available');
			return;
		}

		// Create mutation observer to watch for chart elements
		const observer = new MutationObserver((mutations) => {
			let chartElementsAdded = false;
			
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType === Node.ELEMENT_NODE) {
						const element = node as Element;
						// Check if the added node is a chart or contains charts
						if (element.classList && element.classList.contains('plotly-chart')) {
							chartElementsAdded = true;
						} else if (element.querySelector && element.querySelector('.plotly-chart')) {
							chartElementsAdded = true;
						}
					}
				});
			});
			
			if (chartElementsAdded) {
				console.log('Chart elements detected via mutation observer');
				setTimeout(() => {
					this._renderPendingCharts();
				}, 50);
			}
		});

		// Start observing
		observer.observe(domRoot, {
			childList: true,
			subtree: true
		});

		console.log('Mutation observer set up for chart rendering');
		
		// Store observer for cleanup
		this._mutationObserver = observer;
	}

	_renderPendingCharts() {
		console.log('🎯 _renderPendingCharts called');
		const editor = this.editor;
		const editingView = editor.editing.view;

		// Get the main DOM root from the editing view
		let domRoot: Element | null = null;
		if (editingView.getDomRoot) {
			domRoot = editingView.getDomRoot() || null;
			console.log('📍 Got DOM root via getDomRoot():', domRoot);
		} else {
			const viewRoot = editingView.document.getRoot();
			if (viewRoot) {
				domRoot = editingView.domConverter.viewToDom(viewRoot) as Element;
				console.log('📍 Got DOM root via domConverter:', domRoot);
			}
		}
		
		if (!domRoot) {
			console.log('❌ DOM root not ready yet, skipping chart rendering');
			return;
		}

		console.log('🔍 DOM root found, searching for pending charts...');

		try {
			// Find all pending chart elements in the editing view
			const pendingCharts = domRoot.querySelectorAll('.plotly-chart-pending');
			console.log(`📊 Found ${pendingCharts.length} pending charts:`, pendingCharts);

			pendingCharts.forEach((domElement: Element) => {
				const chartData = domElement.getAttribute('data-chart-data');
				const chartType = domElement.getAttribute('data-chart-type');
				const chartTitle = domElement.getAttribute('data-chart-title');

				if (chartData && chartType) {
					console.log('Rendering chart:', { chartType, chartTitle });
					console.log('🎯 Chart element classes:', domElement.className);
					console.log('🎯 Chart element parent:', domElement.parentElement?.className);
					
					// Find the actual chart container (might be wrapped by CKEditor widget)
					let chartContainer = domElement;
					
					// If this is a CKEditor widget, find the inner chart element
					if (domElement.classList.contains('ck-widget')) {
						// Look for the actual chart div inside the widget
						const innerChart = domElement.querySelector('.plotly-chart:not(.ck-widget)');
						if (innerChart) {
							chartContainer = innerChart as Element;
							console.log('🎯 Found inner chart container:', chartContainer.className);
						}
					}
					
					// Render the chart
					PlotlyRenderer.render(chartContainer, chartData, chartType, chartTitle)
						.then(() => {
							// Remove pending class only after successful render
							domElement.classList.remove('plotly-chart-pending');
							console.log('Chart rendered successfully');
						})
						.catch(error => {
							console.error('Error rendering chart:', error);
							PlotlyRenderer.renderError(chartContainer, error.message);
							// Remove pending class even on error
							domElement.classList.remove('plotly-chart-pending');
						});
				}
			});

			// Also handle charts that might be loaded from content
			const existingCharts = domRoot.querySelectorAll('.plotly-chart:not(.plotly-chart-pending)');
			existingCharts.forEach((domElement: Element) => {
				// Only render if not already rendered (no plotly data)
				if (!domElement.hasAttribute('data-plotly-rendered')) {
					const chartData = domElement.getAttribute('data-chart-data');
					const chartType = domElement.getAttribute('data-chart-type');
					const chartTitle = domElement.getAttribute('data-chart-title');

					if (chartData && chartType) {
						domElement.setAttribute('data-plotly-rendered', 'true');
						console.log('Rendering existing chart:', { chartType, chartTitle });
						
						PlotlyRenderer.render(domElement, chartData, chartType, chartTitle)
							.then(() => {
								console.log('Existing chart rendered successfully');
							})
							.catch(error => {
								console.error('Error rendering existing chart:', error);
								PlotlyRenderer.renderError(domElement, error.message);
							});
					}
				}
			});
		} catch (error) {
			console.error('Error in _renderPendingCharts:', error);
		}
	}
}

class InsertPlotlyChartCommand extends Command {
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstPosition = selection.getFirstPosition();
		
		if (firstPosition) {
			const allowedIn = model.schema.findAllowedParent(firstPosition, 'plotlyChart');
			this.isEnabled = allowedIn !== null;
		} else {
			this.isEnabled = false;
		}
	}

	execute(options: { value?: string } = {}) {
		console.log('🚀 InsertPlotlyChartCommand executed with options:', options);
		
		const model = this.editor.model;
		const chartType = options.value || 'scatter';
		
		// Get sample data for the chart type
		const sampleData = this._getSampleData(chartType);
		console.log('📊 Sample data for command:', sampleData);
		
		model.change(writer => {
			console.log('✍️ Creating plotlyChart element via command...');
			const plotlyChart = writer.createElement('plotlyChart', {
				chartData: JSON.stringify(sampleData),
				chartType: chartType,
				chartTitle: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`
			});

			model.insertContent(plotlyChart);
			console.log('✅ Chart inserted via command');
		});
	}
	
	_getSampleData(chartType: string) {
		switch (chartType) {
			case 'scatter':
				return [{
					x: [1, 2, 3, 4, 5],
					y: [2, 4, 3, 5, 6],
					type: 'scatter',
					mode: 'markers',
					name: 'Sample Data'
				}];
			case 'bar':
				return [{
					x: ['A', 'B', 'C', 'D'],
					y: [20, 14, 23, 25],
					type: 'bar',
					name: 'Sample Data'
				}];
			case 'line':
				return [{
					x: [1, 2, 3, 4, 5],
					y: [2, 4, 3, 5, 6],
					type: 'scatter',
					mode: 'lines',
					name: 'Sample Data'
				}];
			case 'pie':
				return [{
					values: [19, 26, 55],
					labels: ['Residential', 'Non-Residential', 'Utility'],
					type: 'pie'
				}];
			case 'histogram':
				return [{
					x: [1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5],
					type: 'histogram',
					name: 'Sample Data'
				}];
			default:
				return [{
					x: [1, 2, 3, 4, 5],
					y: [2, 4, 3, 5, 6],
					type: 'scatter',
					name: 'Sample Data'
				}];
		}
	}
}