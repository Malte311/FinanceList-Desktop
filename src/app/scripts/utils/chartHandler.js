const Chart = require('chart.js');

/**
 * Class for creating charts.
 */
class ChartHandler {
	/**
	 * @param {View} view View object.
	 */
	constructor(view) {
		this.view = view;

		this.colors = [
			'rgba(0, 123, 255, 1)',
			'rgba(40, 167, 69, 1)',
			'rgba(255, 193, 7, 1)',
			'rgba(220, 53, 69, 1)'
		];
		this.colorSeparator = 'rgba(23, 162, 184, 1)';
	}

	/**
	 * Creates a chart in a given canvas to visualize the input data.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createChart(canvas, data) {
		switch (this.view.storage.readPreference('chartType')) {
			case 'pie':
				this.createTransactionChart(canvas, data);
				break;
			case 'doughnut':
				this.createCategoryChart(canvas, data);
				break;
			default:
				this.createTransactionChart(canvas, data);
				break;
		}
	}

	/**
	 * Creates a chart containing the transactions (name, amount) as dataset.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createTransactionChart(canvas, data) {
		while (data.length > this.colors.length) { // Ensure that enough colors are available.
			this.colors = this.colors.concat(this.colors);
		}

		// Ensure that two adjacent parts do not have the same color.
		if (this.colors[data.length - 1] === this.colors[0]) {
			this.colors[data.length - 1] = this.colorSeparator;
		}

		let backgroundColors = this.colors.map(c => c.replace('1)', '0.3)')); // Opacity

		new Chart($(canvas), {
			type: 'pie',
			data: {
				labels: data.map(d => d.name),
				datasets: [{
					data: data.map(d => parseFloat(d.amount).toFixed(2)),
					backgroundColor: backgroundColors,
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

	/**
	 * Creates a chart containing the categories (category name, combined amount of
	 * transactions belonging to that category) as dataset.
	 * 
	 * @param {string} canvas The id of the canvas element which contains the chart.
	 * @param {array} data The input data.
	 */
	createCategoryChart(canvas, data) {
		let dataObj = {};
		let cats = data.map(d => d.category).filter((val, ind, self) => self.indexOf(val) === ind);
		
		cats.forEach(c => dataObj[c] = 0);
		data.forEach(d => dataObj[d.category] += parseFloat(d.amount));

		let plotData = [[], []]; // Make sure to keep labels and data in the correct order
		for (const [key, val] of Object.entries(dataObj)) {
			plotData[0].push(key);
			plotData[1].push(val);
		}

		while (plotData[0].length > this.colors.length) { // Ensure that enough colors are available.
			this.colors = this.colors.concat(this.colors);
		}

		// Ensure that two adjacent parts do not have the same color.
		if (this.colors[plotData[0].length - 1] === this.colors[0]) {
			this.colors[plotData[0].length - 1] = this.colorSeparator;
		}

		let backgroundColors = this.colors.map(c => c.replace('1)', '0.3)')); // Opacity

		new Chart($(canvas), {
			type: 'doughnut',
			data: {
				labels: plotData[0],
				datasets: [{
					data: plotData[1],
					backgroundColor: backgroundColors,
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

module.exports = ChartHandler;