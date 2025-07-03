import Plotly from 'plotly.js/lib/core';
import scatter from 'plotly.js/lib/scatter';
import bar from 'plotly.js/lib/bar';
import pie from 'plotly.js/lib/pie';
import histogram from 'plotly.js/lib/histogram';

// Register chart types
Plotly.register([scatter, bar, pie, histogram]);

export default class PlotlyRenderer {
	static render(element, chartData, chartType, chartTitle) {
		return new Promise((resolve, reject) => {
			try {
				// Clear existing content
				element.innerHTML = '';

				// Parse chart data if it's a string
				let data;
				if (typeof chartData === 'string') {
					data = JSON.parse(chartData);
				} else {
					data = chartData;
				}

				// Ensure data is an array
				if (!Array.isArray(data)) {
					data = [data];
				}

				// Create layout
				const layout = {
					title: chartTitle || 'Chart',
					margin: { l: 40, r: 40, t: 40, b: 40 },
					responsive: true,
					autosize: true,
					paper_bgcolor: 'white',
					plot_bgcolor: 'white',
					height: 280,
					width: null // Let it be responsive
				};

				// Configure options
				const config = {
					displayModeBar: false,
					responsive: true,
					showTips: false,
					staticPlot: false
				};

				console.log('Rendering chart with data:', data);
				console.log('Chart element:', element);
				
				// Debug element state before rendering
				console.log('📏 Element dimensions before render:', {
					offsetWidth: element.offsetWidth,
					offsetHeight: element.offsetHeight,
					clientWidth: element.clientWidth,
					clientHeight: element.clientHeight,
					getBoundingClientRect: element.getBoundingClientRect()
				});
				
				const computedStyle = window.getComputedStyle(element);
				console.log('🎨 Element computed styles:', {
					display: computedStyle.display,
					visibility: computedStyle.visibility,
					opacity: computedStyle.opacity,
					overflow: computedStyle.overflow,
					width: computedStyle.width,
					height: computedStyle.height,
					position: computedStyle.position
				});

				// Create the chart
				Plotly.newPlot(element, data, layout, config)
					.then(() => {
						console.log('Plotly chart created successfully');
						
						// Debug element state after rendering
						console.log('📏 Element dimensions AFTER render:', {
							offsetWidth: element.offsetWidth,
							offsetHeight: element.offsetHeight,
							clientWidth: element.clientWidth,
							clientHeight: element.clientHeight,
							getBoundingClientRect: element.getBoundingClientRect()
						});
						
						console.log('🏗️ Element HTML after render (first 500 chars):', element.innerHTML.substring(0, 500));
						console.log('🔍 Plotly elements found:', {
							hasJsPlotlyPlot: element.classList.contains('js-plotly-plot'),
							plotlyDivs: element.querySelectorAll('.js-plotly-plot').length,
							svgElements: element.querySelectorAll('svg').length,
							plotlyTraces: element.querySelectorAll('.scatterlayer').length
						});
						
						// Check if charts are actually visible
						const rect = element.getBoundingClientRect();
						const isVisible = rect.width > 0 && rect.height > 0;
						console.log('👁️ Chart visibility check:', {
							isVisible,
							hasWidth: rect.width > 0,
							hasHeight: rect.height > 0,
							rect
						});
						
						// Add resize handler
						const resizeHandler = () => {
							if (element.offsetParent !== null) {
								Plotly.Plots.resize(element);
							}
						};

						// Store resize handler on element for cleanup
						element._plotlyResizeHandler = resizeHandler;
						window.addEventListener('resize', resizeHandler);

						// Mark as rendered
						element.setAttribute('data-plotly-rendered', 'true');
						
						resolve(true);
					})
					.catch(error => {
						console.error('Error rendering Plotly chart:', error);
						PlotlyRenderer.renderError(element, error.message);
						reject(error);
					});
			} catch (error) {
				console.error('Error parsing chart data:', error);
				PlotlyRenderer.renderError(element, 'Invalid chart data: ' + error.message);
				reject(error);
			}
		});
	}

	static renderError(element, errorMessage) {
		element.innerHTML = `
			<div class="plotly-chart-placeholder">
				<div>
					<div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
					<div>Error rendering chart</div>
					<div style="font-size: 12px; color: #999; margin-top: 5px;">${errorMessage}</div>
				</div>
			</div>
		`;
	}

	static renderPlaceholder(element, chartTitle = 'Chart') {
		element.innerHTML = `
			<div class="plotly-chart-placeholder">
				<div>
					<div class="plotly-chart-title">${chartTitle}</div>
					<div>Click to configure chart</div>
				</div>
			</div>
		`;
	}

	static cleanup(element) {
		// Clean up plotly chart
		if (element._plotlyResizeHandler) {
			window.removeEventListener('resize', element._plotlyResizeHandler);
			delete element._plotlyResizeHandler;
		}

		// Purge plotly chart
		if (element && element.data) {
			Plotly.purge(element);
		}
	}
}