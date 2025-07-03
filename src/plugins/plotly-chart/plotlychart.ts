import { Plugin } from 'ckeditor5';
import PlotlyChartEditing from './plotlychartediting';
import PlotlyChartUI from './plotlychartui';

export default class PlotlyChart extends Plugin {
	static get requires() {
		return [PlotlyChartEditing, PlotlyChartUI];
	}

	static get pluginName() {
		return 'PlotlyChart';
	}
}