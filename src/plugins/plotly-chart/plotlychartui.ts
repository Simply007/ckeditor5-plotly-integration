import { Plugin, createDropdown, addListToDropdown, Collection } from 'ckeditor5';

export default class PlotlyChartUI extends Plugin {
	init() {
		console.log('🎯 PlotlyChartUI init() called');
		const editor = this.editor;
		const t = editor.t;

		// Add the plotlyChart button to the toolbar
		console.log('📝 Registering plotlyChart component in componentFactory');
		editor.ui.componentFactory.add('plotlyChart', locale => {
			console.log('🏗️ plotlyChart component factory called with locale:', locale);
			const dropdownView = createDropdown(locale);
			const collection = new Collection();

			// Chart types
			const chartTypes = [
				{ type: 'scatter', label: 'Scatter Plot' },
				{ type: 'bar', label: 'Bar Chart' },
				{ type: 'line', label: 'Line Chart' },
				{ type: 'pie', label: 'Pie Chart' },
				{ type: 'histogram', label: 'Histogram' }
			];

			// Create simple dropdown items
			console.log('📋 Creating dropdown items for chart types:', chartTypes);
			chartTypes.forEach((chartType, index) => {
				console.log(`📄 Creating item ${index}: ${chartType.label}`);
				
				const def = {
					type: 'button' as const,
					model: {
						label: chartType.label,
						withText: true
					}
				};

				console.log(`📤 Adding item to collection:`, def);
				collection.add(def);
			});

			console.log('📋 Collection created with items:', collection.length);
			addListToDropdown(dropdownView, collection);
			console.log('📋 List added to dropdown');

			// Handle dropdown item clicks with extensive debugging
			console.log('🎯 Setting up dropdown execute handler...');
			
			dropdownView.on('execute', (evt) => {
				console.log('🚨 DROPDOWN EXECUTE EVENT FIRED!');
				console.log('🔍 Event source label:', evt.source.label);
				
				// Find chart type by matching the label
				const clickedLabel = evt.source.label;
				const chartType = chartTypes.find(ct => ct.label === clickedLabel);
				
				console.log('🔍 Clicked label:', clickedLabel);
				console.log('🔍 Found chart type:', chartType);
				
				if (chartType) {
					console.log('🔥 DROPDOWN ITEM CLICKED:', chartType.type);
					console.log('🚀 About to execute command...');
					editor.execute('insertPlotlyChart', { value: chartType.type });
					dropdownView.isOpen = false;
					console.log('✅ Command executed and dropdown closed');
				} else {
					console.log('❌ No matching chart type found for label:', clickedLabel);
				}
			});

			// Also listen for any other events on the dropdown
			dropdownView.on('change:isOpen', (evt, property, newValue) => {
				console.log('🔄 Dropdown isOpen changed to:', newValue);
			});

			// Debug the collection items structure
			collection.forEach((item, index) => {
				console.log(`🔍 Item ${index} structure:`, item);
				console.log(`🔍 Item ${index} model:`, item.model);
				console.log(`🔍 Item ${index} model type:`, typeof item.model);
				if (item.model) {
					console.log(`🔍 Item ${index} model properties:`, Object.keys(item.model));
				}
			});

			dropdownView.buttonView.set({
				label: t('Insert Chart'),
				icon: this._getChartIcon(),
				tooltip: true
			});

			console.log('🎯 Dropdown configured, returning dropdownView');
			console.log('🎯 Dropdown button view:', dropdownView.buttonView);
			console.log('🎯 Dropdown is enabled:', dropdownView.isEnabled);

			return dropdownView;
		});
	}

	_insertChart(chartType: string) {
		console.log('🚀 _insertChart called with type:', chartType);
		const editor = this.editor;
		const model = editor.model;

		// Sample data for different chart types
		const sampleData = this._getSampleData(chartType);
		console.log('📊 Sample data generated:', sampleData);

		model.change(writer => {
			console.log('✍️ Creating plotlyChart element...');
			const plotlyChart = writer.createElement('plotlyChart', {
				chartData: JSON.stringify(sampleData),
				chartType: chartType,
				chartTitle: 'Sample Chart'
			});

			console.log('📝 Chart element created:', plotlyChart);
			console.log('📄 Chart attributes:', {
				chartData: JSON.stringify(sampleData),
				chartType: chartType,
				chartTitle: 'Sample Chart'
			});

			model.insertContent(plotlyChart);
			console.log('✅ Chart inserted into model');
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

	_getChartIcon() {
		return '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v14h14v-2H5V3H3zm4 10V9h2v4H7zm3-6v6h2V7h-2zm3 3v3h2v-3h-2z"/></svg>';
	}
}

