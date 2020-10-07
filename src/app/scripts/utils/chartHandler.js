const Chart = require('chart.js');

/**
 * Class for creating charts.
 */
module.exports = class ChartHandler {
	constructor(view) {
		this.colors = [
			'rgba(0, 123, 255, 1)',
			'rgba(40, 167, 69, 1)',
			'rgba(255, 193, 7, 1)',
			'rgba(220, 53, 69, 1)'
		];
		
		this.colorSeparator = 'rgba(23, 162, 184, 1)';

		this.view = view;
	}

	/**
	 * Creates a chart in a given canvas to visualize the input data.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} labels The labels for the data in form of a string array.
	 * @param {array} dataset The data that will be visualized in form of a number array.
	 */
	createChart(canvas, labels, dataset) {
		while (dataset.length > this.colors.length) { // Ensure that enough colors are available.
			this.colors = this.colors.concat(this.colors);
		}

		// Ensure that two adjacent parts do not have the same color.
		if (this.colors[dataset.length - 1] === this.colors[0]) {
			this.colors[dataset.length - 1] = this.colorSeparator;
		}

		new Chart($(canvas), {
			type: this.view.storage.readPreference('chartType'),
			data: {
				labels: labels,
				datasets: [{
					data: dataset,
					backgroundColor: this.colors.map(c => c.replace('1)', '0.3)')), // Opacity
					borderColor: this.colors,
					borderWidth: 1
				}]
			},
			options: {
				tooltips: {
					callbacks: {
						label: (ttI, cD) => {
							let sum = this.view.printNum(cD.datasets[0].data[ttI.index]);
							return `${cD.labels[ttI.index]}: ${sum}`;
						}
					}
				}
			}
		});
	}
}