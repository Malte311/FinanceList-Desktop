const Chart = require('chart.js');

/**
 * Class for creating charts.
 */
module.exports = class ChartHandler {
	constructor(view) {
		this.colors = [
			'rgba(255, 99, 132, 1)',
			'rgba(0, 162, 235, 1)',
			'rgba(255, 206, 86, 1)',
			'rgba(75, 192, 192, 1)',
			'rgba(153, 102, 255, 1)',
			'rgba(255, 159, 64, 1)',
			'rgba(255, 100, 170, 1)',
			'rgba(255, 255, 102, 1)',
			'rgba(80, 189, 255, 1)'
		];
		
		this.colorSeparator = 'rgba(150, 255, 120, 1)';

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
					backgroundColor: this.colors,
					borderColor: this.colors,
					borderWidth: 0
				}]
			},
			options: {
				tooltips: {
					callbacks: {
						label: (ttI, cD) => {
							let cS = this.view.getCurrencySign();
							return `${cD.labels[ttI.index]}: ${cD.datasets[0].data[ttI.index]}${cS}`;
						}
					}
				},
				legend: {display: false},
				display: false
			}
		});
	}
}