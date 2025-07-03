/**
 * CKEditor 5 with Plotly.js Integration
 */

import { ClassicEditor, Essentials, Paragraph, Bold, Italic, Link, AutoLink, Autosave } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

import PlotlyChart from './plugins/plotly-chart/plotlychart';

const LICENSE_KEY = 'GPL';

export default class PlotlyEditor extends ClassicEditor {}

PlotlyEditor.builtinPlugins = [
	Essentials,
	Paragraph,
	Bold,
	Italic,
	Link,
	AutoLink,
	Autosave,
	PlotlyChart
];

PlotlyEditor.defaultConfig = {
	toolbar: {
		items: ['undo', 'redo', '|', 'bold', 'italic', '|', 'link', '|', 'plotlyChart'],
		shouldNotGroupWhenFull: false
	},
	initialData:
		'<h2>Welcome to CKEditor 5 with Plotly.js Integration! 📊</h2>\n<p>\n\tYou now have a powerful text editor with integrated chart capabilities using Plotly.js.\n\tClick the chart button in the toolbar to insert interactive charts into your content.\n</p>\n<h3>Chart Features</h3>\n<ul>\n\t<li>📈 <strong>Multiple Chart Types:</strong> Scatter plots, bar charts, line charts, pie charts, and histograms</li>\n\t<li>🎨 <strong>Interactive Charts:</strong> Hover, zoom, and pan capabilities</li>\n\t<li>📱 <strong>Responsive Design:</strong> Charts adapt to different screen sizes</li>\n\t<li>💾 <strong>Data Persistence:</strong> Chart data is saved with your content</li>\n</ul>\n<p>\n\tTry clicking the chart button (📊) in the toolbar above to insert your first chart!\n</p>\n<h3>Sample Chart</h3>\n<p>Here\'s what a chart looks like in the editor:</p>\n<div class="plotly-chart" data-chart-data=\'{"x": [1, 2, 3, 4, 5], "y": [2, 4, 3, 5, 6], "type": "scatter", "mode": "lines+markers", "name": "Sample Data"}\' data-chart-type="scatter" data-chart-title="Sample Line Chart"></div>\n<p>\n\tCharts are saved as part of your content and will render properly when the content is displayed.\n</p>\n',
	licenseKey: LICENSE_KEY,
	link: {
		addTargetToExternalLinks: true,
		defaultProtocol: 'https://',
		decorators: {
			toggleDownloadable: {
				mode: 'manual',
				label: 'Downloadable',
				attributes: {
					download: 'file'
				}
			}
		}
	},
	placeholder: 'Type or paste your content here!'
};

function setupDebugButtons(editor: any) {
	console.log('🔧 Setting up debug buttons...');
	
	// Import Plotly for external chart creation
	import('./plugins/plotly-chart/plotlyrenderer').then(({ default: PlotlyRenderer }) => {
		// Debug button 1: Insert chart directly
		const insertButton = document.getElementById('debug-insert-chart');
		if (insertButton) {
			insertButton.addEventListener('click', () => {
				console.log('🔥 DEBUG: Insert chart button clicked');
				try {
					const model = editor.model;
					const sampleData = [{
						x: [1, 2, 3, 4, 5],
						y: [2, 4, 3, 5, 6],
						type: 'scatter',
						mode: 'markers',
						name: 'CKEditor Chart'
					}];
					
					model.change((writer: any) => {
						console.log('🔧 Creating debug chart element...');
						const plotlyChart = writer.createElement('plotlyChart', {
							chartData: JSON.stringify(sampleData),
							chartType: 'scatter',
							chartTitle: 'CKEditor Chart'
						});
						
						console.log('🔧 Debug chart element created:', plotlyChart);
						model.insertContent(plotlyChart);
						console.log('🔧 Debug chart inserted');
					});
				} catch (error) {
					console.error('🚨 Error inserting debug chart:', error);
				}
			});
		}
		
		// Debug button 2: Check DOM state
		const checkButton = document.getElementById('debug-check-dom');
		if (checkButton) {
			checkButton.addEventListener('click', () => {
				console.log('🔍 DEBUG: Checking DOM state...');
				const editingView = editor.editing.view;
				console.log('📍 Editing view:', editingView);
				
				let domRoot = null;
				if (editingView.getDomRoot) {
					domRoot = editingView.getDomRoot();
					console.log('📍 DOM root (getDomRoot):', domRoot);
				}
				
				if (domRoot) {
					const allCharts = domRoot.querySelectorAll('.plotly-chart');
					const pendingCharts = domRoot.querySelectorAll('.plotly-chart-pending');
					console.log(`📊 Total charts found: ${allCharts.length}`);
					console.log(`⏳ Pending charts found: ${pendingCharts.length}`);
					console.log('📊 All chart elements:', allCharts);
					console.log('⏳ Pending chart elements:', pendingCharts);
					
					// Check dimensions and visibility
					allCharts.forEach((chart: Element, index: number) => {
						const rect = chart.getBoundingClientRect();
						const styles = window.getComputedStyle(chart);
						console.log(`📏 Chart ${index + 1} dimensions:`, {
							width: rect.width,
							height: rect.height,
							display: styles.display,
							visibility: styles.visibility,
							opacity: styles.opacity,
							overflow: styles.overflow
						});
					});
				}
			});
		}
		
		// Debug button 3: Create external chart
		const externalButton = document.getElementById('debug-create-external-chart');
		if (externalButton) {
			externalButton.addEventListener('click', () => {
				console.log('🌍 DEBUG: Creating external chart...');
				const externalContainer = document.getElementById('external-chart');
				if (externalContainer) {
					const sampleData = [{
						x: [1, 2, 3, 4, 5],
						y: [2, 4, 3, 5, 6],
						type: 'scatter',
						mode: 'markers',
						name: 'External Chart'
					}];
					
					console.log('🌍 External container:', externalContainer);
					console.log('🌍 External container dimensions:', {
						width: externalContainer.offsetWidth,
						height: externalContainer.offsetHeight,
						clientWidth: externalContainer.clientWidth,
						clientHeight: externalContainer.clientHeight
					});
					
					PlotlyRenderer.render(externalContainer, sampleData, 'scatter', 'External Reference Chart')
						.then(() => {
							console.log('✅ External chart rendered successfully');
							console.log('🌍 External chart HTML:', externalContainer.innerHTML.substring(0, 500) + '...');
						})
						.catch(error => {
							console.error('❌ External chart failed:', error);
						});
				}
			});
		}
		
		// Debug button 4: Compare HTML structure
		const compareButton = document.getElementById('debug-compare-html');
		if (compareButton) {
			compareButton.addEventListener('click', () => {
				console.log('🔍 DEBUG: Comparing HTML structures...');
				
				// Get external chart HTML
				const externalContainer = document.getElementById('external-chart');
				const externalHTML = externalContainer ? externalContainer.innerHTML : 'No external chart';
				
				// Get CKEditor chart HTML
				const editingView = editor.editing.view;
				let ckeditorHTML = 'No CKEditor charts';
				
				if (editingView && editingView.getDomRoot) {
					const domRoot = editingView.getDomRoot();
					const allCharts = domRoot?.querySelectorAll('.plotly-chart');
					if (allCharts && allCharts.length > 0) {
						ckeditorHTML = allCharts[0].innerHTML;
					}
				}
				
				console.log('🌍 EXTERNAL CHART HTML (first 1000 chars):', externalHTML.substring(0, 1000));
				console.log('📝 CKEDITOR CHART HTML (first 1000 chars):', ckeditorHTML.substring(0, 1000));
				
				// Compare key elements
				const externalHasPlotlyDiv = externalHTML.includes('js-plotly-plot');
				const externalHasSVG = externalHTML.includes('<svg');
				const ckeditorHasPlotlyDiv = ckeditorHTML.includes('js-plotly-plot');
				const ckeditorHasSVG = ckeditorHTML.includes('<svg');
				
				console.log('🔍 COMPARISON RESULTS:', {
					external: {
						hasPlotlyDiv: externalHasPlotlyDiv,
						hasSVG: externalHasSVG,
						htmlLength: externalHTML.length
					},
					ckeditor: {
						hasPlotlyDiv: ckeditorHasPlotlyDiv,
						hasSVG: ckeditorHasSVG,
						htmlLength: ckeditorHTML.length
					}
				});
			});
		}
	});
}

// Wait for DOM to load, then initialize editor
document.addEventListener('DOMContentLoaded', () => {
	const editorElement = document.querySelector('#editor');
	if (!editorElement) {
		console.error('Editor element not found');
		return;
	}

	// Initialize the editor
	PlotlyEditor.create(editorElement as HTMLElement, PlotlyEditor.defaultConfig)
		.then(editor => {
			console.log('Editor initialized successfully with Plotly.js integration!');
			(window as any).editor = editor;
			
			// Setup debug buttons
			setupDebugButtons(editor);
		})
		.catch(error => {
			console.error('Error initializing editor:', error);
		});
});